const crypto = require('crypto');

/**
 * Bank statement parsers.
 *
 * Three formats, one output shape. Banks differ wildly in what they send:
 * Kenyan banks typically export CSV from their portal, SWIFT-connected
 * correspondents send MT940, and ISO-20022 banks send CAMT.053 XML. The
 * matcher should not know or care which.
 *
 * Every parser returns lines of:
 *   {
 *     amountMinor,   // BigInt, signed: credits positive, debits negative
 *     currency,
 *     valueDate,     // Date
 *     reference,     // raw, exactly as the bank sent it
 *     description,
 *     counterparty,
 *     lineHash,      // identity within the statement, for dedupe
 *   }
 *
 * Amounts are parsed to integer minor units without passing through a float —
 * see utils/money.js for why.
 */

const { fromMajor } = require('../utils/money');

/** SHA-256 of the raw file. Re-importing the same statement is rejected on this. */
function hashFile(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Identity of a line within its statement.
 *
 * Includes the row index because a genuine statement can legitimately contain
 * two identical credits on the same day (two investors sending the same amount
 * with no reference). Hashing only the content would silently drop the second.
 */
function hashLine(index, parts) {
    return crypto
        .createHash('sha256')
        .update(`${index}|${parts.join('|')}`)
        .digest('hex')
        .slice(0, 32);
}

/* ------------------------------------------------------------------- CSV */

/** Split a CSV line, honouring quoted fields containing commas. */
function splitCsvLine(line) {
    const out = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            // Doubled quote inside a quoted field is a literal quote.
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            out.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    out.push(current);
    return out.map((v) => v.trim());
}

/** Locate a column by any of several likely header names. */
function findColumn(headers, candidates) {
    const normalised = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    for (const candidate of candidates) {
        const target = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
        const index = normalised.indexOf(target);
        if (index !== -1) return index;
    }
    return -1;
}

/**
 * CSV export from a bank portal.
 *
 * Header names are not standardised, so each field accepts the aliases the
 * common Kenyan and international portals actually emit. Credit and debit may
 * arrive as one signed column or as two separate ones.
 */
function parseCsv(text, { currency }) {
    const rows = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (rows.length < 2) throw new Error('CSV statement has no data rows');

    const headers = splitCsvLine(rows[0]);
    const col = {
        date: findColumn(headers, ['date', 'value date', 'valuedate', 'transaction date', 'posting date']),
        amount: findColumn(headers, ['amount', 'value', 'transaction amount']),
        credit: findColumn(headers, ['credit', 'money in', 'deposit', 'cr']),
        debit: findColumn(headers, ['debit', 'money out', 'withdrawal', 'dr']),
        reference: findColumn(headers, ['reference', 'ref', 'payment reference', 'narrative', 'details']),
        description: findColumn(headers, ['description', 'particulars', 'narration', 'transaction details']),
        counterparty: findColumn(headers, ['counterparty', 'payer', 'sender', 'from', 'name']),
        currency: findColumn(headers, ['currency', 'ccy']),
    };

    if (col.date === -1) throw new Error('CSV statement has no recognisable date column');
    if (col.amount === -1 && col.credit === -1 && col.debit === -1) {
        throw new Error('CSV statement has no recognisable amount, credit or debit column');
    }

    const lines = [];
    for (let i = 1; i < rows.length; i++) {
        const cells = splitCsvLine(rows[i]);
        const rawDate = cells[col.date];
        if (!rawDate) continue;

        const valueDate = parseDate(rawDate);
        if (!valueDate) continue;

        const rowCurrency = col.currency !== -1 && cells[col.currency] ? cells[col.currency] : currency;

        let amountMinor;
        if (col.amount !== -1 && cells[col.amount]) {
            amountMinor = parseSignedAmount(cells[col.amount], rowCurrency);
        } else {
            const credit = col.credit !== -1 ? cells[col.credit] : '';
            const debit = col.debit !== -1 ? cells[col.debit] : '';
            if (credit && Number.parseFloat(credit.replace(/,/g, '')) !== 0) {
                amountMinor = fromMajor(credit.replace(/[^0-9.-]/g, ''), rowCurrency).amount;
            } else if (debit && Number.parseFloat(debit.replace(/,/g, '')) !== 0) {
                amountMinor = -fromMajor(debit.replace(/[^0-9.-]/g, ''), rowCurrency).amount;
            } else {
                continue; // A zero row carries no money; skip rather than store noise.
            }
        }

        const reference = col.reference !== -1 ? cells[col.reference] || null : null;
        const description = col.description !== -1 ? cells[col.description] || null : null;
        const counterparty = col.counterparty !== -1 ? cells[col.counterparty] || null : null;

        lines.push({
            amountMinor,
            currency: rowCurrency.toUpperCase(),
            valueDate,
            reference,
            description,
            counterparty,
            lineHash: hashLine(i, [rawDate, String(amountMinor), reference || '', description || '']),
        });
    }

    return lines;
}

/** "1,234.56", "(1,234.56)" and "-1234.56" are all negative-capable forms. */
function parseSignedAmount(raw, currency) {
    const text = String(raw).trim();
    // Accounting notation: parentheses mean negative.
    const negative = /^\(.*\)$/.test(text) || text.startsWith('-');
    const digits = text.replace(/[^0-9.]/g, '');
    if (!digits) throw new Error(`Cannot parse amount: ${raw}`);
    const magnitude = fromMajor(digits, currency).amount;
    return negative ? -magnitude : magnitude;
}

/**
 * Dates arrive in every order banks can imagine.
 *
 * ISO first, then explicit day-first formats. Deliberately does NOT fall back
 * to `new Date(string)`: that parses "03/04/2026" as March 4th in a US locale
 * and April 3rd elsewhere, which would silently mis-date half a statement.
 */
function parseDate(raw) {
    const text = String(raw).trim();

    // YYYY-MM-DD or YYYY/MM/DD
    let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(text);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));

    // DD/MM/YYYY or DD-MM-YYYY — the dominant form on Kenyan and UK statements.
    m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(text);
    if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));

    // DD MMM YYYY
    m = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(text);
    if (m) {
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const month = months.indexOf(m[2].toLowerCase());
        if (month !== -1) return new Date(Date.UTC(+m[3], month, +m[1]));
    }

    return null;
}

/* ----------------------------------------------------------------- MT940 */

/**
 * SWIFT MT940.
 *
 * Statement lines are `:61:` (value date, C/D marker, amount) optionally
 * followed by `:86:` free-text detail. Amounts use a comma as the decimal
 * separator, which is the classic MT940 parsing trap.
 */
function parseMt940(text, { currency }) {
    const lines = [];
    const rows = text.split(/\r?\n/);

    let current = null;
    let index = 0;

    const push = () => {
        if (!current) return;
        lines.push({
            ...current,
            lineHash: hashLine(index++, [
                current.valueDate.toISOString().slice(0, 10),
                String(current.amountMinor),
                current.reference || '',
                current.description || '',
            ]),
        });
        current = null;
    };

    for (const row of rows) {
        if (row.startsWith(':61:')) {
            push();
            // :61:YYMMDD[MMDD]{C|D|RC|RD}amount[,amount]N<type><ref>
            const body = row.slice(4);
            const m = /^(\d{6})(\d{4})?(R?[CD])([\d,]+)/.exec(body);
            if (!m) continue;

            const [, yymmdd, , marker, rawAmount] = m;
            const year = 2000 + Number(yymmdd.slice(0, 2));
            const month = Number(yymmdd.slice(2, 4)) - 1;
            const day = Number(yymmdd.slice(4, 6));

            // MT940 uses a comma for the decimal point.
            const magnitude = fromMajor(rawAmount.replace(',', '.'), currency).amount;
            // R-prefixed markers are reversals: RC reverses a credit.
            const isCredit = marker === 'C' || marker === 'RD';

            current = {
                amountMinor: isCredit ? magnitude : -magnitude,
                currency: currency.toUpperCase(),
                valueDate: new Date(Date.UTC(year, month, day)),
                reference: (body.split('//')[1] || '').trim() || null,
                description: null,
                counterparty: null,
            };
        } else if (row.startsWith(':86:') && current) {
            const detail = row.slice(4).trim();
            current.description = detail || null;
            // Many banks put the payer's reference in the :86: free text, which
            // is often the only place our payment reference appears.
            if (!current.reference) current.reference = detail || null;
        }
    }
    push();

    return lines;
}

/* -------------------------------------------------------------- CAMT.053 */

/** Minimal XML tag reader — enough for CAMT without an XML dependency. */
function tagValue(xml, tag) {
    const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
    return m ? m[1].trim() : null;
}

function allBlocks(xml, tag) {
    const out = [];
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
    let m;
    while ((m = re.exec(xml)) !== null) out.push(m[1]);
    return out;
}

/**
 * ISO-20022 CAMT.053.
 *
 * Each `<Ntry>` is a statement entry with an amount, a credit/debit indicator
 * (`CRDT`/`DBIT`) and reference fields. Parsed with regexes rather than an XML
 * library on purpose: this reads a handful of known tags from a well-formed
 * bank file, and adding an XML parser dependency for that is not worth it.
 * If a bank ever sends something exotic, swap in a real parser here.
 */
function parseCamt053(xml, { currency }) {
    const lines = [];
    const entries = allBlocks(xml, 'Ntry');

    entries.forEach((entry, index) => {
        const amtRaw = tagValue(entry, 'Amt');
        if (!amtRaw) return;

        const ccyMatch = /<Amt[^>]*Ccy="([A-Z]{3})"/i.exec(entry);
        const entryCurrency = ccyMatch ? ccyMatch[1] : currency;

        const indicator = (tagValue(entry, 'CdtDbtInd') || '').toUpperCase();
        const magnitude = fromMajor(amtRaw, entryCurrency).amount;

        const dateBlock = tagValue(entry, 'ValDt') || tagValue(entry, 'BookgDt') || '';
        const dateText = tagValue(dateBlock, 'Dt') || tagValue(dateBlock, 'DtTm') || dateBlock;
        const valueDate = parseDate(String(dateText).slice(0, 10));
        if (!valueDate) return;

        const reference =
            tagValue(entry, 'EndToEndId') ||
            tagValue(entry, 'InstrId') ||
            tagValue(entry, 'AcctSvcrRef') ||
            null;
        const description = tagValue(entry, 'Ustrd') || tagValue(entry, 'AddtlNtryInf') || null;
        const counterparty = tagValue(tagValue(entry, 'Dbtr') || '', 'Nm') || null;

        lines.push({
            amountMinor: indicator === 'CRDT' ? magnitude : -magnitude,
            currency: entryCurrency.toUpperCase(),
            valueDate,
            reference,
            description,
            counterparty,
            lineHash: hashLine(index, [
                valueDate.toISOString().slice(0, 10),
                String(magnitude),
                reference || '',
                description || '',
            ]),
        });
    });

    return lines;
}

/* ------------------------------------------------------------- dispatch */

const FORMATS = { CSV: parseCsv, MT940: parseMt940, CAMT053: parseCamt053 };

/** Guess the format so an operator does not have to classify their own file. */
function detectFormat(text, filename = '') {
    const name = filename.toLowerCase();
    if (text.trimStart().startsWith('<?xml') || /<Document[\s>]/i.test(text)) return 'CAMT053';
    if (/^:\d{2}[A-Z]?:/m.test(text) || name.endsWith('.sta')) return 'MT940';
    return 'CSV';
}

function parseStatement(buffer, { filename, currency, format }) {
    const text = buffer.toString('utf8');
    const chosen = format || detectFormat(text, filename);
    const parser = FORMATS[chosen];
    if (!parser) throw new Error(`Unsupported statement format: ${chosen}`);

    const lines = parser(text, { currency });
    if (lines.length === 0) throw new Error('No statement lines could be read from this file');

    const dates = lines.map((l) => l.valueDate.getTime());
    return {
        format: chosen,
        fileHash: hashFile(buffer),
        periodStart: new Date(Math.min(...dates)),
        periodEnd: new Date(Math.max(...dates)),
        lines,
    };
}

module.exports = {
    parseStatement,
    detectFormat,
    parseCsv,
    parseMt940,
    parseCamt053,
    parseDate,
    parseSignedAmount,
    splitCsvLine,
    hashFile,
};
