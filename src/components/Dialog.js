import React from "react";
import PropTypes from "prop-types";
import { Backdrop } from "@material-ui/core";

function Dialog({
  className,
  isOpen,
  onClose,
  children,
}) {
  return (
    <Backdrop className={className} open={isOpen} onClick={() => onClose()}>{/* wrapped on close so it doesnt get the event call */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90%", maxHeight: "90%", overflow: "hidden"}}>
        {children}
      </div>
    </Backdrop>);
}

Dialog.propTypes = {
  className: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node,
};

export default Dialog;
