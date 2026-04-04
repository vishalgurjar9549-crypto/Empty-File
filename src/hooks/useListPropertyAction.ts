import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type UseListPropertyActionProps = {
  onRequirePhone?: () => void;
};

export function useListPropertyAction({
  onRequirePhone,
}: UseListPropertyActionProps = {}) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const shouldShowListProperty = user?.role?.toUpperCase() !== "OWNER";

  const handleListPropertyClick = () => {
    if (!user) {
      onRequirePhone?.();
      return;
    }

    if (user.role?.toUpperCase() === "OWNER") {
      navigate("/owner/dashboard");
      return;
    }

    onRequirePhone?.();
  };

  return {
    user,
    shouldShowListProperty,
    handleListPropertyClick,
  };
}