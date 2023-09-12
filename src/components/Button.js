import React from "react";
import PropTypes from "prop-types";
import MuiButton from "@material-ui/core/Button";
import Spinner from "./Spinner";

function Button({
  children,
  disabled,
  onClick,
  isLoading,
  primary,
  secondary,
  icon,
}) {
  let color = undefined;
  if (primary) color = "primary";
  if (secondary) color = "secondary";

  return (
    <MuiButton
      color={color}
      variant="outlined"
      onClick={onClick}
      disabled={disabled || isLoading}
      startIcon={icon}
    >
      {children}
      {isLoading && <Spinner className="button-spinner"/>}
    </MuiButton>);
}

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
};

export default Button;
