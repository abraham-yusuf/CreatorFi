// Use commonjs require
const { PrismaClient } = require('@prisma/client')

// @ts-ignore
const prisma = new PrismaClient()

async function seed() {
  const creator = await prisma.user.create({
    data: {
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    }
  })

  const content = await prisma.content.create({
    data: {
      title: "Exclusive Video",
      description: "This is a premium video.",
      type: "VIDEO",
      price: 5.0,
      thumbnailUrl: "https://via.placeholder.com/640x360",
      contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Dummy video
      creatorId: creator.id,
    }
  })

  console.log(content.id)
}

seed().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
