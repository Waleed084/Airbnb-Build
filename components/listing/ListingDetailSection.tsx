"use client";

import { AiOutlineClockCircle } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { BiArea } from "react-icons/bi";

type Props = {
  minimumBookingLength: number;
  crewCount: number;
  area: number;
};

function BookingInfo({ minimumBookingLength, crewCount, area }: Props) {
  return (
    <div className="flex justify-between items-center font-light text-neutral-500">
      {/* Minimum Booking Length */}
      <div className="flex flex-col items-center">
        <AiOutlineClockCircle size={25} className="text-gray-700" />
        <span className="font-semibold text-lg">Min booking length</span>
        <span>{minimumBookingLength} hr minimum</span>
      </div>
      {/* Cast & Crew */}
      <div className="flex flex-col items-center">
        <FaUsers size={25} className="text-gray-700" />
        <span className="font-semibold text-lg">Cast & Crew</span>
        <span>{crewCount} people</span>
      </div>
      {/* Area */}
      <div className="flex flex-col items-center">
        <BiArea size={25} className="text-gray-700" />
        <span className="font-semibold text-lg">Square footage</span>
        <span>{area} sq/ft</span>
      </div>
    </div>
  );
}

export default BookingInfo;
