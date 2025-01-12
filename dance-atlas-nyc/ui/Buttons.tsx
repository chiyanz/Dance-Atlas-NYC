import Button, { ButtonProps } from "@mui/material/Button";
import { SxProps } from "@mui/material/styles";
import "./styles.css";

interface NavButtonProps extends ButtonProps {
  name: string;
  icon?: JSX.Element;
}

const defaultButtonStyles: SxProps = {
  variant: "contained",
  padding: "8px 16px",
};

export function NavButton({ name, icon, ...props }: NavButtonProps) {
  return (
    <Button {...props} sx={{ ...defaultButtonStyles }} startIcon={icon}>
      <span className="media-hidden-600">{name}</span>
    </Button>
  );
}
