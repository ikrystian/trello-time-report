'use client';

import React, { useMemo } from 'react';
import { type ProcessedCardData, type TrelloLabel } from '@/types/time-report';
interface ChartsProps {
    timeData: ProcessedCardData[];
    listMap: Record<string, string>;
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
    dictionary: ChartsDictionary;
}


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  // ArcElement removed
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Pie import removed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  // ArcElement removed
  Title,
  Tooltip,
  Legend
);

// Interfaces
interface TimeEntry {
    memberId?: string;
    date?: string;
    hours: number;
    comment: string;
}

// Updated ChartsProps interface
interface ChartsProps {
    timeData: ProcessedCardData[];
    dictionary: ChartsDictionary;
}

// Updated ChartsDictionary interface
export interface ChartsDictionary {
    hoursAxisLabel: string;
    reportedHoursLabel: string;
    labelHoursTitle: string; // Added labelHoursTitle
    noData: string;
}


// Chart options (can be customized)
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false,
        },
    },
};

// Corrected syntax for getBarChartOptions
const getBarChartOptions = (dictionary: ChartsDictionary) => ({
    ...commonChartOptions,
    indexAxis: 'y' as const, // Set to 'y' for horizontal bars
    scales: {
        x: { // Values (hours) are now on the x-axis
            beginAtZero: true,
            title: { display: true, text: dictionary.hoursAxisLabel }
        },
        y: { // Categories (labels) are now on the y-axis
            // Optional: Add y-axis title if desired
            // title: { display: true, text: 'Labels' }
        }
    },
}); // Correctly closed object and function call


export default function Charts({ timeData, dictionary }: ChartsProps) {

    // Calculate data for Label Hours Chart (Bar)
    const labelHoursData = useMemo(() => {
        const hoursByLabel: Record<string, number> = {};
        timeData.forEach((card: ProcessedCardData) => {
            const cardTotalHours = card.timeEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.hours || 0), 0);

            if (cardTotalHours > 0 && card.labels && card.labels.length > 0) {
                const hoursPerLabel = cardTotalHours / card.labels.length;
                card.labels.forEach((label: TrelloLabel) => {
                    // Ensure label and label.name are accessed safely
                    const labelName = label?.name || 'Unnamed Label';
                    hoursByLabel[labelName] = (hoursByLabel[labelName] || 0) + hoursPerLabel;
                });
            } else if (cardTotalHours > 0) {
                // Optional: Assign hours to a default category if no labels
                // hoursByLabel['No Label'] = (hoursByLabel['No Label'] || 0) + cardTotalHours;
            }
        });

        const sortedLabels = Object.entries(hoursByLabel)
                                .sort(([, hoursA], [, hoursB]) => hoursB - hoursA);

        const labels = sortedLabels.map(([name]) => name);
        const data = sortedLabels.map(([, hours]) => parseFloat(hours.toFixed(2)));

        const backgroundColors = data.map((_, index) => `hsl(${(index * 40) % 360}, 60%, 70%)`);
        const borderColors = data.map((_, index) => `hsl(${(index * 40) % 360}, 60%, 50%)`);

        return {
            labels,
            datasets: [
                {
                    label: dictionary.reportedHoursLabel,
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
        };
    }, [timeData, dictionary]);

    const dynamicBarOptions = useMemo(() => getBarChartOptions(dictionary), [dictionary]);

    return (
        <div className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{dictionary.labelHoursTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative h-80 md:h-96">
                        {labelHoursData.labels.length > 0 ? (
                            <Bar options={dynamicBarOptions} data={labelHoursData} />
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">{dictionary.noData}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
