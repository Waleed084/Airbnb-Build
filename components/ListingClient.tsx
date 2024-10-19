"use client";

import useLoginModel from "@/hook/useLoginModal";
import { SafeReservation, SafeUser, safeListing } from "@/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-toastify";

import Container from "./Container";
import ListingHead from "./listing/ListingHead";
import ListingInfo from "./listing/ListingInfo";
import ListingReservation from "./listing/ListingReservation";
import { categories } from "./navbar/Categories";
import ListingDetailSection from "./listing/ListingDetailSection";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

type Props = {
  reservations?: SafeReservation[];
  listing: safeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
};

function ListingClient({ reservations = [], listing, currentUser }: Props) {
  const router = useRouter();
  const loginModal = useLoginModel();

  // Disable dates based on existing reservations
  const disableDates = useMemo(() => {
    let dates: Date[] = [];
    reservations.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });
      dates = [...dates, ...range];
    });
    return dates;
  }, [reservations]);

  // States for price, date range, and times
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [startTime, setStartTime] = useState(""); // Start time
  const [endTime, setEndTime] = useState(""); // End time

  // Handle reservation creation
  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
  
    // Calculate total hours
    const hours = startTime && endTime ? calculateHours(startTime, endTime) : 0;
  
    const reservationData = {
      totalPrice,
      startDate: dateRange.startDate.toISOString(), // Format as ISO string
      endDate: dateRange.endDate.toISOString(),     // Format as ISO string
      startTime,                                    // Include start time
      endTime,                                      // Include end time
      listingId: listing?.id,
      totalHours: hours,                            // Include total hours
    };
  
    console.log("Reservation Data:", reservationData); // Log data
    setIsLoading(true);
  
    axios
      .post("/api/reservations", reservationData)
      .then(() => {
        toast.success("Success!");
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error("Something Went Wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, startTime, endTime, router, currentUser, loginModal]);
  

  // Function to calculate hours from startTime and endTime
  const calculateHours = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    return (endInMinutes - startInMinutes) / 60; // Return in hours
  };


  // Ensure price updates based on date and time
  useEffect(() => {
    const dayCount = dateRange.startDate && dateRange.endDate
      ? differenceInCalendarDays(dateRange.endDate, dateRange.startDate)
      : 0;
    
    const hours = startTime && endTime ? calculateHours(startTime, endTime) : 0;

    const minimumBookingLength = Number(listing.minimumBookingLength) || 0;
    const calculatedTotal = Math.max(hours, minimumBookingLength) * listing.price;

    // Multiply by the number of days if dates are selected
    setTotalPrice(dayCount ? calculatedTotal * dayCount : calculatedTotal);
  }, [dateRange, startTime, endTime, listing.price, listing.minimumBookingLength]);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            id={listing.id}
            currentUser={currentUser}
          />
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              category={category}
              description={listing.description}
              roomCount={listing.roomCount}
              guestCount={listing.guestCount}
              bathroomCount={listing.bathroomCount}
              locationValue={listing.locationValue}
            />
            <div className="order-first mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.price}
                minimumBookingLength={Number(listing.minimumBookingLength)} // Cast to number
                totalPrice={totalPrice}
                onChangeDate={(value) => {
                  if (value instanceof Date) {
                    setDateRange({
                      startDate: value,
                      endDate: value,
                      key: "selection",
                    });
                  } else {
                    setDateRange(value);
                  }
                }}
                
                onSubmit={onCreateReservation}
                onChangeTime={(startTime, endTime) => {
                  setStartTime(startTime); // Update state for start time
                  setEndTime(endTime);     // Update state for end time
                }}
                disabled={isLoading}
                disabledDates={disableDates}
                crewCount={listing.crewCount}
              />
            </div>
          </div>
          <ListingDetailSection
            minimumBookingLength={listing.minimumBookingLength}
            crewCount={listing.crewCount}
            area={listing.area}
          />
        </div>
      </div>
    </Container>
  );
}

export default ListingClient;
