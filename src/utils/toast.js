import { toast } from "vue3-toastify";

export function showToast(message, type = "info", duration = 3000) {
  switch (type) {
    case "success":
      toast.success(message, { autoClose: duration });
      break;
    case "error":
      toast.error(message, { autoClose: duration });
      break;
    case "warning":
      toast.warning(message, { autoClose: duration });
      break;
    default:
      toast.info(message, { autoClose: duration });
  }
}
