import React, { ReactNode } from "react";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

interface Props extends ButtonProps {
  isLoading?: boolean;
  children?: ReactNode;
}

const LoadingButton = ({ isLoading, children, ...props }: Props) => {
  return (
    <Button
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader className="animate-spin mr-2" /> : null}
      {children}
    </Button>
  );
};
export default LoadingButton;
