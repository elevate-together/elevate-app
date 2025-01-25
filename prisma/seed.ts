import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      image: "",
    },
    {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      image: "",
    },
    {
      name: "Catherine Davis",
      email: "catherine.davis@example.com",
      image: "",
    },
    {
      name: "David Brown",
      email: "david.brown@example.com",
      image: "",
    },
    {
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      image: "",
    },
    {
      name: "Frank Harris",
      email: "frank.harris@example.com",
      image: "",
    },
    {
      name: "Grace Moore",
      email: "grace.moore@example.com",
      image: "",
    },
    {
      name: "Hannah Clark",
      email: "hannah.clark@example.com",
      image: "",
    },
    {
      name: "Ian Thomas",
      email: "ian.thomas@example.com",
      image: "",
    },
    {
      name: "Jack Martin",
      email: "jack.martin@example.com",
      image: "",
    },
    {
      name: "Laura White",
      email: "laura.white@example.com",
      image: "",
    },
    {
      name: "Nathan Green",
      email: "nathan.green@example.com",
      image: "",
    },
    {
      name: "Olivia Scott",
      email: "olivia.scott@example.com",
      image: "",
    },
    {
      name: "Peter Edwards",
      email: "peter.edwards@example.com",
      image: "",
    },
    {
      name: "Quincy Taylor",
      email: "quincy.taylor@example.com",
      image: "",
    },
    {
      name: "Rachel Evans",
      email: "rachel.evans@example.com",
      image: "",
    },
    {
      name: "Samuel Parker",
      email: "samuel.parker@example.com",
      image: "",
    },
    {
      name: "Tina Roberts",
      email: "tina.roberts@example.com",
      image: "",
    },
    {
      name: "Uma Watson",
      email: "uma.watson@example.com",
      image: "",
    },
    {
      name: "Victor Anderson",
      email: "victor.anderson@example.com",
      image: "",
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  }

  console.log("Seeded users successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
