export function formatDateWithArabicMonthsAndTime(date: string | Date): string {
  const eventDate = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'long', 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  };

  return new Intl.DateTimeFormat('ar-EG', options).format(eventDate);
}

// export function formatDateWithArabicMonthsAndTime(date: string | Date): string {
//     const eventDate = new Date(date);

//     const options: Intl.DateTimeFormatOptions = {
//       weekday: 'long', // Full day name (e.g., الجمعة)
//       year: 'numeric', // Year in numeric format
//       month: 'long',   // Full month name (e.g., أكتوبر)
//       day: '2-digit',  // Day in numeric format
//       hour: '2-digit', // Hour in numeric format
//       minute: '2-digit', // Minute in numeric format
//       hour12: true,    // Use 12-hour clock (AM/PM)
//     };

//     // Format the date in Arabic
//     const formattedDate = new Intl.DateTimeFormat('ar-EG', options).format(eventDate);

//     // Replace Arabic numerals with Western numerals
//     const arabicToWesternNumerals: { [key: string]: string } = {
//       '٠': '0',
//       '١': '1',
//       '٢': '2',
//       '٣': '3',
//       '٤': '4',
//       '٥': '5',
//       '٦': '6',
//       '٧': '7',
//       '٨': '8',
//       '٩': '9',
//     };

//     // Replace Arabic numerals in the formatted string
//     const result = formattedDate.replace(/[٠-٩]/g, (match) => arabicToWesternNumerals[match]);

//     return result;
//   }
