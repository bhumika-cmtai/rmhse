import React from 'react';
import { parse, differenceInYears, isValid } from 'date-fns';

interface AgeCellProps {
  dateOfBirth?: string | null;
}

const AgeCell: React.FC<AgeCellProps> = ({ dateOfBirth }) => {
  if (!dateOfBirth) {
    return <div className="font-medium text-gray-500">-</div>;
  }

  // Parse the "yyyy-MM-dd" string into a Date object
  const birthDate = parse(dateOfBirth, 'dd-MM-yyyy', new Date());

  // If parsing fails, return a placeholder
  if (!isValid(birthDate)) {
    return <div className="font-medium text-gray-500">-</div>;
  }

  // Calculate the difference in full years between today and the birth date
  const age = differenceInYears(new Date(), birthDate);

  return <div className="font-medium">{age}</div>;
};

export default AgeCell;