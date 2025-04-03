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

const barChartOptions = {
    ...commonChartOptions,
    scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: 'Godziny' }
        },
    },
};

const pieChartOptions = {
    ...commonChartOptions,
    // No scales for pie charts
};


export default function Charts({ timeData, listMap, memberMap }: ChartsProps) {

    // Calculate data for User Hours Chart (Bar)
    const userHoursData = useMemo(() => {
        const hoursByUser: Record<string, number> = {};
        timeData.forEach(card => {
            card.timeEntries.forEach(entry => {
                const userId = entry.memberId || 'unknown';
                const userName = userId && memberMap[userId] ? memberMap[userId].fullName : 'Nieznany Użytkownik';
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
                    label: 'Zaraportowane Godziny',
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [timeData, memberMap]);

    // Calculate data for List Hours Chart (Pie)
    const listHoursData = useMemo(() => {
        const hoursByList: Record<string, number> = {};
        timeData.forEach(card => {
            const listId = card.listId || 'unknown';
            const listName = listMap[listId] || 'Nieznana Lista';
            const listHours = card.timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
            if (listHours > 0) { // Only include lists with reported time
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
                    label: 'Zaraportowane Godziny',
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
        };
    }, [timeData, listMap]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* User Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Godziny na Użytkownika</CardTitle>
                    {/* Optional: <CardDescription>...</CardDescription> */}
                </CardHeader>
                <CardContent>
                    <div className="relative h-64 md:h-80"> {/* Set height for canvas container */}
                        {userHoursData.labels.length > 0 ? (
                            <Bar options={barChartOptions} data={userHoursData} />
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">Brak danych</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* List Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Godziny na Listę</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative h-64 md:h-80"> {/* Set height for canvas container */}
                        {listHoursData.labels.length > 0 ? (
                            <Pie options={pieChartOptions} data={listHoursData} />
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">Brak danych</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
