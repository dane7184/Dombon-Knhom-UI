import {AppBaseCategoryType} from "./common.type";

export type UpcomingEvent = {
    eventId: string;
    image: string;
    name: string;
    type: AppBaseCategoryType;
    date: string;
    location: string;
    price: string;
}