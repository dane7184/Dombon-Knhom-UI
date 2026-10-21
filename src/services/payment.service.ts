// Selects the real or mock payment service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/payment.service";
import * as mock from "@/services/mock/payment.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getPaymentQrImageService, checkPaymentStatusService } = service;
