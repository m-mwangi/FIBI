require("dotenv/config");
const { prisma } = require("../config/db");
const { ciandaMasterPlan } = require("./data/cianda-master-plan");

/**
 * Adds The Cianda Polo & Forest City and its linked components.
 *
 * Additive and re-runnable, unlike seed-projects.js, which wipes the Project
 * table first — and with it every Investment and Payment row pointing at one.
 * Use this one against a database that already has real activity in it.
 *
 * Matching is by title: the seed data has no stable ids of its own, and a
 * title collision inside one master plan is not a thing an operator can create
 * by accident.
 */
async function upsertProject(seed, parentId = null) {
  const { timeline, images = [], components: _components, ...data } = seed;

  const existing = await prisma.project.findFirst({
    where: { title: data.title },
    select: { id: true },
  });

  if (!existing) {
    const project = await prisma.project.create({
      data: {
        ...data,
        parentId,
        timeline: { create: timeline },
        projectImages: { create: images.map((imageUrl) => ({ imageUrl })) },
      },
    });
    return { project, created: true };
  }

  // Funding raised and investor count belong to the live listing, not to the
  // seed file. Re-running this must never roll an investor's contribution back
  // to zero, so those two fields are dropped from the update.
  const { currentFundingMinor: _raised, investorsCount: _investors, ...editable } = data;

  await prisma.timeline.deleteMany({ where: { projectId: existing.id } });
  await prisma.projectImage.deleteMany({ where: { projectId: existing.id } });

  const project = await prisma.project.update({
    where: { id: existing.id },
    data: {
      ...editable,
      parentId,
      timeline: { create: timeline },
      projectImages: { create: images.map((imageUrl) => ({ imageUrl })) },
    },
  });
  return { project, created: false };
}

async function seedCianda() {
  const { project: master, created } = await upsertProject(ciandaMasterPlan);
  console.log(`${created ? "Created" : "Updated"} master plan: ${master.title} (${master.id})`);

  for (const component of ciandaMasterPlan.components) {
    const result = await upsertProject(component, master.id);
    console.log(
      `  ${result.created ? "created" : "updated"} component: ${result.project.title}`
    );
  }

  console.log(
    `Done. ${ciandaMasterPlan.components.length} components linked to ${master.title}.`
  );
}

seedCianda()
  .catch((error) => {
    console.error("Cianda seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
