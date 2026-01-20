import { ExpenseCircle } from "@/domain/circles";

export function demoCircles(): ExpenseCircle[] {
  return [
    {
      id: "c_goa_trip",
      name: "Goa Trip 2024",
      icon: "🌴",
      currency: "INR",
      createdAt: "2024-03-01T10:00:00Z",
      updatedAt: "2024-03-15T18:30:00Z",
      defaultSplitType: "equal",
      members: [
        {
          id: "finos_x7A9KQ", // Current User (Arjun)
          name: "Arjun (You)",
          role: "admin",
          joinedAt: "2024-03-01T10:00:00Z",
          reminderPreferences: { tone: "neutral", mutedCircles: [], blockedUsers: [] }
        },
        {
          id: "finos_9B2zX1",
          name: "Rohan",
          role: "member",
          joinedAt: "2024-03-01T10:05:00Z",
          reminderPreferences: { tone: "soft", mutedCircles: [], blockedUsers: [] }
        },
        {
          id: "finos_3C8yW2",
          name: "Sneha",
          role: "member",
          joinedAt: "2024-03-01T10:10:00Z",
          reminderPreferences: { tone: "direct", mutedCircles: [], blockedUsers: [] }
        }
      ],
      expenses: [
        {
          id: "exp_1",
          circleId: "c_goa_trip",
          description: "Villa Booking",
          amount: 15000,
          paidBy: "finos_x7A9KQ",
          date: "2024-03-05T14:00:00Z",
          category: "Accommodation",
          createdAt: "2024-03-05T14:05:00Z",
          createdBy: "finos_x7A9KQ",
          splits: [
            { memberId: "finos_x7A9KQ", amount: 5000, percentage: 33.33 },
            { memberId: "finos_9B2zX1", amount: 5000, percentage: 33.33 },
            { memberId: "finos_3C8yW2", amount: 5000, percentage: 33.33 }
          ]
        },
        {
          id: "exp_2",
          circleId: "c_goa_trip",
          description: "Dinner & Drinks",
          amount: 4500,
          paidBy: "finos_9B2zX1",
          date: "2024-03-06T20:00:00Z",
          category: "Food",
          createdAt: "2024-03-06T20:10:00Z",
          createdBy: "finos_9B2zX1",
          splits: [
            { memberId: "finos_x7A9KQ", amount: 1500, percentage: 33.33 },
            { memberId: "finos_9B2zX1", amount: 1500, percentage: 33.33 },
            { memberId: "finos_3C8yW2", amount: 1500, percentage: 33.33 }
          ]
        },
        {
          id: "exp_3",
          circleId: "c_goa_trip",
          description: "Scooter Rental",
          amount: 3000,
          paidBy: "finos_3C8yW2",
          date: "2024-03-07T10:00:00Z",
          category: "Transport",
          createdAt: "2024-03-07T10:15:00Z",
          createdBy: "finos_3C8yW2",
          splits: [
            { memberId: "finos_x7A9KQ", amount: 1000, percentage: 33.33 },
            { memberId: "finos_9B2zX1", amount: 1000, percentage: 33.33 },
            { memberId: "finos_3C8yW2", amount: 1000, percentage: 33.33 }
          ]
        }
      ]
    },
    {
      id: "c_flat_expenses",
      name: "Flat 402",
      icon: "🏠",
      currency: "INR",
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-03-20T11:00:00Z",
      defaultSplitType: "equal",
      members: [
        {
          id: "finos_x7A9KQ",
          name: "Arjun (You)",
          role: "admin",
          joinedAt: "2024-01-01T09:00:00Z",
          reminderPreferences: { tone: "neutral", mutedCircles: [], blockedUsers: [] }
        },
        {
          id: "finos_9B2zX1",
          name: "Rohan",
          role: "member",
          joinedAt: "2024-01-01T09:05:00Z",
          reminderPreferences: { tone: "neutral", mutedCircles: [], blockedUsers: [] }
        }
      ],
      expenses: [
        {
          id: "exp_f1",
          circleId: "c_flat_expenses",
          description: "WiFi Bill",
          amount: 1200,
          paidBy: "finos_x7A9KQ",
          date: "2024-03-10T09:00:00Z",
          category: "Utilities",
          createdAt: "2024-03-10T09:05:00Z",
          createdBy: "finos_x7A9KQ",
          splits: [
            { memberId: "finos_x7A9KQ", amount: 600 },
            { memberId: "finos_9B2zX1", amount: 600 }
          ]
        },
        {
          id: "exp_f2",
          circleId: "c_flat_expenses",
          description: "Electricity",
          amount: 3400,
          paidBy: "finos_9B2zX1",
          date: "2024-03-12T10:00:00Z",
          category: "Utilities",
          createdAt: "2024-03-12T10:05:00Z",
          createdBy: "finos_9B2zX1",
          splits: [
            { memberId: "finos_x7A9KQ", amount: 1700 },
            { memberId: "finos_9B2zX1", amount: 1700 }
          ]
        }
      ]
    }
  ];
}
