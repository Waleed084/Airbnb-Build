import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("API call initiated..."); // Log when the API is called

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    console.error("No current user found."); // Log if no user is found
    return NextResponse.error();
  }

  const body = await request.json();
  console.log("Request body:", body); // Log the request body

  const { listingId, startDate, endDate, totalPrice, startTime, endTime, totalHours } = body;

  // Check for required fields
  if (!listingId || !startDate || !endDate || totalPrice === undefined || totalHours === undefined || !startTime || !endTime) {
    console.error("Missing required fields:", {
      listingId,
      startDate,
      endDate,
      totalPrice,
      totalHours,
      startTime,
      endTime,
    }); // Log which fields are missing
    return NextResponse.error();
  }

  // Convert startDate and endDate to Date objects
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  console.log("Parsed Dates:", { startDateTime, endDateTime }); // Log parsed dates

  try {
    const listenAndReservation = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        reservations: {
          create: {
            userId: currentUser.id,
            startDate: startDateTime,
            endDate: endDateTime,
            totalPrice,
            startTime,  // Store start time
            endTime,    // Store end time
            totalHours, // Store total hours
          },
        },
      },
    });

    console.log("Reservation created successfully:", listenAndReservation); // Log successful reservation creation
    return NextResponse.json(listenAndReservation);
  } catch (error) {
    console.error("Error creating reservation:", error); // Log error for debugging
    return NextResponse.error();
  }
}
