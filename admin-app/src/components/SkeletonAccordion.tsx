'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface SkeletonAccordionProps {
    listCount?: number;
    cardCount?: number;
}

export function SkeletonAccordion({ listCount = 3, cardCount = 5 }: SkeletonAccordionProps) {
    return (
        <div className="w-full space-y-4">
            <Accordion type="multiple" value={Array.from({ length: listCount }).map((_, i) => `skeleton-list-${i}`)}>
                {Array.from({ length: listCount }).map((_, listIndex) => (
                    <AccordionItem key={`skeleton-list-${listIndex}`} value={`skeleton-list-${listIndex}`} className="border rounded bg-muted/30">
                        <AccordionTrigger className="p-3 text-base font-bold hover:no-underline rounded-t">
                            <div className="flex justify-between w-full">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-2 pl-4 border-t border-b">
                            <Accordion type="multiple" value={[]}>
                                {Array.from({ length: cardCount }).map((_, cardIndex) => (
                                    <AccordionItem
                                        key={`skeleton-card-${listIndex}-${cardIndex}`}
                                        value={`skeleton-card-${listIndex}-${cardIndex}`}
                                        className="border rounded mb-2 bg-background"
                                    >
                                        <AccordionTrigger className="p-2 text-sm font-semibold hover:no-underline group rounded-t">
                                            <div className="flex items-center flex-grow mr-2 overflow-hidden">
                                                <Skeleton className="w-3 h-3 mr-2 rounded-sm flex-shrink-0" />
                                                <Skeleton className="h-5 w-48" />
                                            </div>
                                            <Skeleton className="h-4 w-32" />
                                        </AccordionTrigger>
                                        <AccordionContent className="border-t pt-0">
                                            <div className="p-4 space-y-3">
                                                <Skeleton className="h-6 w-full" />
                                                <Skeleton className="h-6 w-full" />
                                                <Skeleton className="h-6 w-3/4" />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
