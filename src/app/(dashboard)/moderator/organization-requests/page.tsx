import React from "react";
import OrganizationRequest from "@/components/dashboard/moderator/OrganizationRequest";
import { getOrganizerRequest } from "@/services/moderator.service";

export default async function page() {
    const organizerRequest = await getOrganizerRequest({ page: 1, size: 11 });
    return (
        <div className="h-full">
            <OrganizationRequest organizerRequest={organizerRequest} />
        </div>
    );
}
