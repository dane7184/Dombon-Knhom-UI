import {
    Badge1Hover,
    Badge2Hover,
    Badge3Hover,
    Badge4Hover,
    Badge5Hover,
    Badge6Hover,
    Badge7Hover,
    Badge8Hover,
    Badge9Hover
} from "@/components/profile/BagdeHoverComponent";

export const BadgesConfig: Record<string, { src: string; fallback: string; color: string }> = {
  "FIRST_TIMER":          { src: "/images/Badges/1.svg",        fallback: "/images/Badges/1-1.svg" , color: "#54c4f0"}, 
  "STREAK_KEEPER":        { src: "/images/Badges/2.svg",     fallback: "/images/Badges/2-2.svg", color: "#a9d11d" },
  "CITY_HOPPER":          { src: "/images/Badges/3.svg",        fallback: "/images/Badges/4-4.svg", color: "#5ad6a1" },
  "MEMORY_MAKER":         { src: "/images/Badges/4.svg",       fallback: "/images/Badges/4-4.svg", color:"#689eff" },
  "CONVERSATION_STARTER": { src: "/images/Badges/5.svg", fallback: "/images/Badges/5-5.svg", color:"#6c5dea" },
  "NICHE_SPECIALIST":     { src: "/images/Badges/6.svg",      fallback: "/images/Badges/6-6.svg", color:"#695be9" },
  "FIRST_IMPRESSION":     { src: "/images/Badges/7.svg",   fallback: "/images/Badges/7-7.svg" , color:"#a85cfc" },

  "CROWD_PULLER":         { src: "/images/Badges/8.svg",       fallback: "/images/Badges/8-8.svg", color:"#fc7376" },
  "HIGHLY_RATED_HOST":    { src: "/images/Badges/9.svg",         fallback: "/images/Badges/9-9.svg", color:"#555450" },
};


export const BadgeHoverConfig: Record<string, React.FC> = {
  "FIRST_TIMER":            Badge1Hover,
  "STREAK_KEEPER":          Badge2Hover,
  "CITY_HOPPER":            Badge3Hover,
  "MEMORY_MAKER":           Badge4Hover,
  "CONVERSATION_STARTER":   Badge5Hover,
  "NICHE_SPECIALIST":       Badge6Hover,
  "FIRST_IMPRESSION":       Badge7Hover,
  "CROWD_PULLER":           Badge8Hover,
  "HIGHLY_RATED_HOST":      Badge9Hover,
};
export const badges = [
    {
        id: 1,
        name: "First Timer",
        image: "/images/Badges/1.svg",
        desc: "Attend your first event on the platform "
    },
    {
        id: 2,
        name: "Streak Keeper",
        image: "/images/Badges/2.svg",
        desc: "Attend at least one event per week for consecutive weeks"
    },
    {
        id: 3,
        name: "City Hopper",
        image: "/images/Badges/3.svg",
        desc: "Attend events in 10 different cities"
    },
    {
        id: 4,
        name: "Memory Maker",
        image: "/images/Badges/4.svg",
        desc: "Post 30 times linked to events you attended"
    },
    {
        id: 5,
        name: "Conversation Starter",
        image: "/images/Badges/5.svg",
        desc: "Leave comments that generate a lot replies"
    },
    {
        id: 6,
        name: "Niche Specialist",
        image: "/images/Badges/6.svg",
        desc: "Attend 15 events in the same category"
    },
    {
        id: 7,
        name: "First Impression",
        image: "/images/Badges/7.svg",
        desc: "Leave the first review on a newly listed event"
    },

    // Organization Badges
    {
        id: 8,
        name: "Crown Puller",
        image: "/images/Badges/8.svg",
        desc: "Fill events to full or near-full capacity 15 times"
    },
    {
        id: 9,
        name: "Highly Rated Host",
        image: "/images/Badges/9.svg",
        desc: "Maintain a 4.5+ average rating 20 times"
    }
]