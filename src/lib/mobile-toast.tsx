import { toast } from "sonner";
import Toast from "@/components/modals/Toast";

/** Error toast (responsive: glass top on mobile, top-right on desktop). */
export const showMobileError = (message: string, title = "Error") =>
  toast.custom((t) => (
    <Toast
      title={title}
      message={message}
      type="error"
      onCloseAction={() => toast.dismiss(t)}
    />
  ));

/** Success toast (responsive). */
export const showMobileSuccess = (message: string, title = "Success") =>
  toast.custom((t) => (
    <Toast
      title={title}
      message={message}
      type="success"
      onCloseAction={() => toast.dismiss(t)}
    />
  ));
