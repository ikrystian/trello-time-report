'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Needed for Pie charts
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // Register ArcElement for Pie charts
  Title,
  Tooltip,
  Legend
);

// Interfaces (should match AdminPanel/TimeReport)
interface TimeEntry {
    memberId?: string;
    date?: string;
    hours: number;
    comment: string;
}

interface ProcessedCardData {
    cardId: string;
    cardName: string;
    cardUrl: string;
    listId: string;
    memberIds: string[];
    // labels: TrelloLabel[]; // Not directly needed for these charts
    estimatedHours: number;
    timeEntries: TimeEntry[];
}

interface ChartsProps {
    timeData: ProcessedCardData[];
    listMap: Record<string, string>;
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
    dictionary: ChartsDictionary; // Add dictionary prop
    // lang prop removed as it's not currently used
}

// Define dictionary structure for Charts
export interface ChartsDictionary {
    hoursAxisLabel: string;
    reportedHoursLabel: string;
    userHoursTitle: string;
    listHoursTitle: string;
    unknownUser: string;
    unknownList: string;
    noData: string;
}


// Chart options (can be customized)
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow charts to fill container height better
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false, // We use h3 tags outside the chart
        },
    },
};

const getBarChartOptions = (dictionary: ChartsDictionary) => ({
    ...commonChartOptions,
    scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: dictionary.hoursAxisLabel } // Use dictionary
        },
    },
});

const pieChartOptions = {
    ...commonChartOptions,
    // No scales for pie charts
};


export default function Charts({ timeData, listMap, memberMap, dictionary }: ChartsProps) { // Remove lang from destructuring

    // Calculate data for User Hours Chart (Bar)
    const userHoursData = useMemo(() => {
        const hoursByUser: Record<string, number> = {};
        timeData.forEach(card => {
            card.timeEntries.forEach(entry => {
                const userId = entry.memberId || 'unknown';
                // Use dictionary for unknown user
                const userName = userId && memberMap[userId] ? memberMap[userId].fullName : dictionary.unknownUser;
                hoursByUser[userName] = (hoursByUser[userName] || 0) + (entry.hours || 0);
            });
        });

        const sortedUsers = Object.entries(hoursByUser).sort(([, hoursA], [, hoursB]) => hoursB - hoursA);
        const labels = sortedUsers.map(([name]) => name);
        const data = sortedUsers.map(([, hours]) => hours);

        return {
            labels,
            datasets: [
                {
                    label: dictionary.reportedHoursLabel, // Use dictionary
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [timeData, memberMap, dictionary]); // Add dictionary dependency

    // Calculate data for List Hours Chart (Pie)
    const listHoursData = useMemo(() => {
        const hoursByList: Record<string, number> = {};
        timeData.forEach(card => {
            const listId = card.listId || 'unknown';
            // Use dictionary for unknown list
            const listName = listMap[listId] || dictionary.unknownList;
            const listHours = card.timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
            if (listHours > 0) {
                hoursByList[listName] = (hoursByList[listName] || 0) + listHours;
            }
        });

        const sortedLists = Object.entries(hoursByList).sort(([, hoursA], [, hoursB]) => hoursB - hoursA);
        const labels = sortedLists.map(([name]) => name);
        const data = sortedLists.map(([, hours]) => hours);

        // Generate dynamic colors for pie chart slices
        const backgroundColors = data.map((_, index) => `hsl(${(index * 360 / data.length) % 360}, 70%, 70%)`);
        const borderColors = data.map((_, index) => `hsl(${(index * 360 / data.length) % 360}, 70%, 50%)`);


        return {
            labels,
            datasets: [
                {
                    label: dictionary.reportedHoursLabel, // Use dictionary
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
        };
    }, [timeData, listMap, dictionary]); // Add dictionary dependency

    // Get dynamic options based on dictionary
    const dynamicBarOptions = useMemo(() => getBarChartOptions(dictionary), [dictionary]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* User Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{dictionary.userHoursTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative h-64 md:h-80">
                        {userHoursData.labels.length > 0 ? (
                            <Bar options={dynamicBarOptions} data={userHoursData} />
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">{dictionary.noData}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* List Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{dictionary.listHoursTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative h-64 md:h-80">
                        {listHoursData.labels.length > 0 ? (
                            <Pie options={pieChartOptions} data={listHoursData} />
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">{dictionary.noData}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
