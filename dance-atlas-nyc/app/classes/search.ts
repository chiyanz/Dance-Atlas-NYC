import { SearchOptions, OrganizedData, SessionData } from "@/types/dataSchema";

export function filterClasses(
  options: SearchOptions,
  data: OrganizedData
): OrganizedData {
  const filteredData: OrganizedData = {};
  // Iterate over each studio in the data
  Object.keys(data).forEach((studioName) => {
    // If studio filter is provided, skip studios that don't match
    if (
      options.studio &&
      options.studio.length > 0 &&
      !options.studio.includes("All") &&
      !options.studio.includes(studioName)
    ) {
      return;
    }

    // Filter the sessions based on the `date` filter
    const studioSessions = data[studioName];

    const filteredSessions =
      options.start_date === undefined
        ? studioSessions
        : Object.keys(studioSessions).reduce((sessionsByDate, dateString) => {
            const sessions = studioSessions[dateString];

            const filteredSessionsForDate = sessions.filter((session) => {
              if (options.start_date && session.start_time) {
                return new Date(session.start_time) > options.start_date;
              }
              return true;
            });

            // If any sessions passed the filter, add them to the result
            if (filteredSessionsForDate.length > 0) {
              sessionsByDate[dateString] = filteredSessionsForDate;
            }

            return sessionsByDate;
          }, {} as { [date: string]: SessionData[] });

    if (Object.keys(filteredSessions).length > 0) {
      filteredData[studioName] = filteredSessions;
    }
  });

  return filteredData;
}
