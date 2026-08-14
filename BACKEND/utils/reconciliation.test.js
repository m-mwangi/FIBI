const test = require('node:test');
const assert = require('node:assert/strict');

const {
    parseStatement,
    detectFormat,
    parseDate,
    parseSignedAmount,
    splitCsvLine,
} = require('../services/statementParser.service');
const { classifyLine, referenceMatches } = require('../services/reconciliation.service');

const buf = (s) => Buffer.from(s, 'utf8');

/* ---------------------------------------------------------------- parsing */

test('CSV statements', async (t) => {
    const csv = [
        'Date,Description,Reference,Credit,Debit,Currency',
        '13/08/2026,Inward transfer,FIBI-AB23CD45,"1,000.00",,USD',
        '13/08/2026,Bank charge,,,"25.50",USD',
        '14/08/2026,Inward transfer,FIBI-XY99ZZ11,"500.25",,USD',
    ].join('\n');

    await t.test('reads credits and debits with correct signs', () => {
        const parsed = parseStatement(buf(csv), { filename: 'a.csv', currency: 'USD' });
        assert.equal(parsed.format, 'CSV');
        assert.equal(parsed.lines.length, 3);
        assert.equal(parsed.lines[0].amountMinor, 100000n);
        // A charge is money leaving the account and must be negative.
        assert.equal(parsed.lines[1].amountMinor, -2550n);
        assert.equal(parsed.lines[2].amountMinor, 50025n);
    });

    await t.test('parses amounts without floating point', () => {
        const parsed = parseStatement(buf(csv), { filename: 'a.csv', currency: 'USD' });
        assert.equal(typeof parsed.lines[0].amountMinor, 'bigint');
        assert.equal(parsed.lines[2].amountMinor, 50025n);
    });

    await t.test('derives the statement period from its lines', () => {
        const parsed = parseStatement(buf(csv), { filename: 'a.csv', currency: 'USD' });
        assert.equal(parsed.periodStart.toISOString().slice(0, 10), '2026-08-13');
        assert.equal(parsed.periodEnd.toISOString().slice(0, 10), '2026-08-14');
    });

    await t.test('the same file always hashes the same, a changed one does not', () => {
        const a = parseStatement(buf(csv), { filename: 'a.csv', currency: 'USD' });
        const b = parseStatement(buf(csv), { filename: 'b.csv', currency: 'USD' });
        assert.equal(a.fileHash, b.fileHash, 'identical content must collide — that is how re-imports are caught');
        const c = parseStatement(buf(csv + '\n15/08/2026,x,FIBI-QQ11QQ11,"1.00",,USD'), {
            filename: 'c.csv',
            currency: 'USD',
        });
        assert.notEqual(a.fileHash, c.fileHash);
    });

    await t.test('two identical credits on one day both survive', () => {
        // Two investors sending the same amount with no reference is legitimate;
        // hashing content alone would silently drop the second.
        const dupe = [
            'Date,Description,Credit',
            '13/08/2026,Inward transfer,"100.00"',
            '13/08/2026,Inward transfer,"100.00"',
        ].join('\n');
        const parsed = parseStatement(buf(dupe), { filename: 'd.csv', currency: 'USD' });
        assert.equal(parsed.lines.length, 2);
        assert.notEqual(parsed.lines[0].lineHash, parsed.lines[1].lineHash);
    });

    await t.test('alternative header names are recognised', () => {
        const alt = ['Value Date,Narrative,Money In', '13/08/2026,FIBI-AB23CD45,"250.00"'].join('\n');
        const parsed = parseStatement(buf(alt), { filename: 'e.csv', currency: 'KES' });
        assert.equal(parsed.lines[0].amountMinor, 25000n);
        assert.equal(parsed.lines[0].currency, 'KES');
    });

    await t.test('a file with no readable lines is rejected', () => {
        assert.throws(
            () => parseStatement(buf('Date,Description\n'), { filename: 'x.csv', currency: 'USD' }),
            /no data rows|No statement lines/
        );
    });
});

test('CSV field splitting', async (t) => {
    await t.test('honours quoted commas', () => {
        assert.deepEqual(splitCsvLine('a,"b,c",d'), ['a', 'b,c', 'd']);
    });
    await t.test('honours doubled quotes', () => {
        assert.deepEqual(splitCsvLine('a,"say ""hi""",b'), ['a', 'say "hi"', 'b']);
    });
});

test('date parsing', async (t) => {
    await t.test('ISO and day-first forms', () => {
        assert.equal(parseDate('2026-08-13').toISOString().slice(0, 10), '2026-08-13');
        assert.equal(parseDate('13/08/2026').toISOString().slice(0, 10), '2026-08-13');
        assert.equal(parseDate('13 Aug 2026').toISOString().slice(0, 10), '2026-08-13');
    });

    await t.test('day-first is not misread as US month-first', () => {
        // 03/04/2026 is 3 April on a Kenyan or UK statement. Reading it as
        // 4 March would mis-date a whole file.
        assert.equal(parseDate('03/04/2026').toISOString().slice(0, 10), '2026-04-03');
    });

    await t.test('unparseable dates return null rather than an invalid Date', () => {
        assert.equal(parseDate('not a date'), null);
        assert.equal(parseDate(''), null);
    });
});

test('amount parsing', async (t) => {
    await t.test('accounting negatives', () => {
        assert.equal(parseSignedAmount('(1,234.56)', 'USD'), -123456n);
        assert.equal(parseSignedAmount('-1234.56', 'USD'), -123456n);
        assert.equal(parseSignedAmount('1,234.56', 'USD'), 123456n);
    });
});

test('MT940 statements', async (t) => {
    const mt940 = [
        ':20:STMT001',
        ':25:12345678',
        ':60F:C260813USD0,00',
        ':61:2608130813C1000,00NTRFFIBI-AB23CD45//REF1',
        ':86:INWARD TRANSFER FIBI-AB23CD45 FROM J DOE',
        ':61:2608130813D25,50NCHGCHARGE//REF2',
        ':86:MONTHLY SERVICE CHARGE',
        ':62F:C260813USD974,50',
    ].join('\n');

    await t.test('is auto-detected', () => {
        assert.equal(detectFormat(mt940, 'x.sta'), 'MT940');
    });

    await t.test('reads the comma decimal separator correctly', () => {
        const parsed = parseStatement(buf(mt940), { filename: 's.sta', currency: 'USD' });
        // 1000,00 is one thousand — not one hundred thousand.
        assert.equal(parsed.lines[0].amountMinor, 100000n);
    });

    await t.test('C and D markers set the sign', () => {
        const parsed = parseStatement(buf(mt940), { filename: 's.sta', currency: 'USD' });
        assert.equal(parsed.lines.length, 2);
        assert.ok(parsed.lines[0].amountMinor > 0n);
        assert.equal(parsed.lines[1].amountMinor, -2550n);
    });

    await t.test('carries the :86: detail into the description', () => {
        const parsed = parseStatement(buf(mt940), { filename: 's.sta', currency: 'USD' });
        assert.match(parsed.lines[0].description, /FIBI-AB23CD45/);
    });
});

test('CAMT.053 statements', async (t) => {
    const camt = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02"><BkToCstmrStmt><Stmt>
  <Ntry><Amt Ccy="USD">1000.00</Amt><CdtDbtInd>CRDT</CdtDbtInd>
    <ValDt><Dt>2026-08-13</Dt></ValDt>
    <NtryDtls><TxDtls><Refs><EndToEndId>FIBI-AB23CD45</EndToEndId></Refs>
    <RmtInf><Ustrd>Investment payment</Ustrd></RmtInf>
    <RltdPties><Dbtr><Nm>Jane Doe</Nm></Dbtr></RltdPties></TxDtls></NtryDtls></Ntry>
  <Ntry><Amt Ccy="USD">25.50</Amt><CdtDbtInd>DBIT</CdtDbtInd>
    <ValDt><Dt>2026-08-14</Dt></ValDt>
    <AddtlNtryInf>Service charge</AddtlNtryInf></Ntry>
</Stmt></BkToCstmrStmt></Document>`;

    await t.test('is auto-detected', () => {
        assert.equal(detectFormat(camt, 'x.xml'), 'CAMT053');
    });

    await t.test('CRDT and DBIT set the sign', () => {
        const parsed = parseStatement(buf(camt), { filename: 'c.xml', currency: 'USD' });
        assert.equal(parsed.lines.length, 2);
        assert.equal(parsed.lines[0].amountMinor, 100000n);
        assert.equal(parsed.lines[1].amountMinor, -2550n);
    });

    await t.test('extracts reference and counterparty', () => {
        const parsed = parseStatement(buf(camt), { filename: 'c.xml', currency: 'USD' });
        assert.equal(parsed.lines[0].reference, 'FIBI-AB23CD45');
        assert.equal(parsed.lines[0].counterparty, 'Jane Doe');
    });
});

/* --------------------------------------------------------------- matching */

const line = (over = {}) => ({
    amountMinor: 100000n,
    currency: 'USD',
    reference: 'FIBI-AB23CD45',
    description: null,
    counterparty: null,
    ...over,
});

const payment = (over = {}) => ({
    id: 'pay-1',
    providerRef: 'FIBI-AB23CD45',
    amountMinor: 100000n,
    settledAmountMinor: 0n,
    currency: 'USD',
    ...over,
});

test('reference matching', async (t) => {
    await t.test('survives the mangling banks apply', () => {
        assert.ok(referenceMatches(line({ reference: 'fibi-ab23cd45' }), 'FIBI-AB23CD45'));
        assert.ok(referenceMatches(line({ reference: 'REF: FIBI AB23CD45 PAYMENT' }), 'FIBI-AB23CD45'));
        assert.ok(referenceMatches(line({ reference: null, description: 'FIBI-AB23CD45' }), 'FIBI-AB23CD45'));
    });

    await t.test('a different reference does not match', () => {
        assert.ok(!referenceMatches(line({ reference: 'FIBI-ZZ99ZZ99' }), 'FIBI-AB23CD45'));
    });

    await t.test('an empty or tiny reference never matches', () => {
        // Guards against a short string matching half the statement.
        assert.ok(!referenceMatches(line(), ''));
        assert.ok(!referenceMatches(line(), 'AB'));
    });
});

test('line classification', async (t) => {
    await t.test('exact reference and amount auto-matches', () => {
        const r = classifyLine(line(), [payment()]);
        assert.equal(r.decision, 'auto');
        assert.equal(r.paymentId, 'pay-1');
    });

    await t.test('a debit is never an incoming payment', () => {
        const r = classifyLine(line({ amountMinor: -100000n }), [payment()]);
        assert.equal(r.decision, 'none');
        assert.match(r.note, /Debit/);
    });

    await t.test('no matching reference is an unattributed credit', () => {
        const r = classifyLine(line({ reference: 'SOMETHING ELSE' }), [payment()]);
        assert.equal(r.decision, 'none');
    });

    await t.test('a short payment needs review, never a silent full settle', () => {
        const r = classifyLine(line({ amountMinor: 50000n }), [payment()]);
        assert.equal(r.decision, 'review');
        assert.match(r.note, /Short payment/);
    });

    await t.test('an overpayment needs review', () => {
        const r = classifyLine(line({ amountMinor: 150000n }), [payment()]);
        assert.equal(r.decision, 'review');
        assert.match(r.note, /Overpayment/);
    });

    await t.test('a currency mismatch is never auto-matched', () => {
        const r = classifyLine(line({ currency: 'KES' }), [payment({ currency: 'USD' })]);
        assert.equal(r.decision, 'review');
        assert.match(r.note, /Currency mismatch/);
    });

    await t.test('an ambiguous reference is never guessed between', () => {
        // Crediting the wrong investor is worse than making someone look.
        const r = classifyLine(line(), [payment(), payment({ id: 'pay-2' })]);
        assert.equal(r.decision, 'review');
        assert.equal(r.paymentId, null);
        assert.match(r.note, /matches 2 open payments/);
    });

    await t.test('a partially settled payment matches on its remaining balance', () => {
        const r = classifyLine(
            line({ amountMinor: 40000n }),
            [payment({ amountMinor: 100000n, settledAmountMinor: 60000n })]
        );
        assert.equal(r.decision, 'auto');
    });
});
