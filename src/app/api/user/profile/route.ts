import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { IncomeStream } from "@/domain/models";

export async function PATCH(req: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
