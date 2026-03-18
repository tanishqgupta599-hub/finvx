import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma, { isDatabaseAvailable } from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";
import { IncomeStream } from "@/domain/models";

export async function PATCH(req: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // MongoDB path
  if (isMongoAvailable()) {
    try {
      const body = await req.json();
      const { incomeStreams, ...userFields } = body;

      const users = await getCollection<any>("users");
      const incomeCol = await getCollection<any>("incomeStreams");
      if (!users) {
        return NextResponse.json({ error: "Database unavailable. Changes were not saved." }, { status: 503 });
      }

      // Update user document
      const allowedFields = [
        "name","avatarUrl","mode","riskProfile","financialArchetype",
        "profession","ageRange","country","countryCode","currency",
        "hasDependents","employment","monthlyIncomeRange","monthlyFixedCostRange",
        "insuranceHealth","insuranceTerm","emergencyContactName","emergencyContactPhone",
        "onboardingCompleted"
      ];
      const filteredFields = Object.keys(userFields)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = userFields[key];
          return obj;
        }, {});

      await users.updateOne(
        { clerkId: user.id },
        { $set: { ...filteredFields, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );

      // Replace income streams for this user
      if (incomeCol && Array.isArray(incomeStreams)) {
        await incomeCol.deleteMany({ clerkId: user.id });
        if (incomeStreams.length > 0) {
          await incomeCol.insertMany(
            incomeStreams.map((stream: IncomeStream) => ({
              clerkId: user.id,
              name: stream.name,
              type: stream.type,
              amount: Number(stream.amount),
              frequency: stream.frequency,
              predictability: Number(stream.predictability),
              createdAt: new Date().toISOString(),
            }))
          );
        }
      }

      const updatedUser = await users.findOne({ clerkId: user.id });
      const updatedIncome = incomeCol ? await incomeCol.find({ clerkId: user.id }).toArray() : [];
      return NextResponse.json({ ...updatedUser, incomeStreams: updatedIncome });
    } catch (error) {
      console.error("Error updating profile (Mongo):", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // Prisma path
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json(
      { error: "Database unavailable. Changes were not saved." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { incomeStreams, ...userFields } = body;

    // Define allowed fields to prevent Prisma errors with unknown properties
    const allowedFields = [
      "name", "avatarUrl", "mode", "riskProfile", "financialArchetype", 
      "profession", "ageRange", "country", "countryCode", "currency", 
      "hasDependents", "employment", "monthlyIncomeRange", "monthlyFixedCostRange", 
      "insuranceHealth", "insuranceTerm", "emergencyContactName", "emergencyContactPhone",
      "onboardingCompleted"
    ];

    const filteredFields = Object.keys(userFields)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = userFields[key];
        return obj;
      }, {});

    // Prepare the update object
    const updateData: any = { ...filteredFields };

    // Handle Income Streams separately if provided
    // Since Prisma update with nested relations can be tricky for "replace all",
    // we might need a transaction: delete old streams, create new ones, or use upsert if they have IDs.
    // However, for simplicity in this profile update (which often overwrites the list), 
    // we can delete all existing for this user and create new ones if incomeStreams is an array.
    
    const prismaUpdate = await prisma.$transaction(async (tx) => {
      // First, find the user to get their internal ID
      const dbUser = await tx.user.findUnique({
        where: { clerkId: user.id },
      });

      if (!dbUser) {
        throw new Error("User not found in database");
      }

      if (incomeStreams && Array.isArray(incomeStreams)) {
        // Delete existing
        await tx.incomeStream.deleteMany({
          where: { userId: dbUser.id },
        });

        // Create new ones
        if (incomeStreams.length > 0) {
           await tx.incomeStream.createMany({
             data: incomeStreams.map((stream: IncomeStream) => ({
               name: stream.name,
               type: stream.type,
               amount: Number(stream.amount),
               frequency: stream.frequency,
               predictability: Number(stream.predictability),
               userId: dbUser.id,
             })),
           });
        }
      }

      // Update User fields
      const updatedUser = await tx.user.update({
        where: { id: dbUser.id },
        data: {
          ...filteredFields,
        },
        include: {
          incomeStreams: true,
        },
      });

      return updatedUser;
    });

    return NextResponse.json(prismaUpdate);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
