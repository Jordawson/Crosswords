import React from "react";
import { CircularProgress } from "@material-ui/core";

// change styles/components/button.scss opus-button-spinner -12 margin offsets if you change this size={24} here
export default className => <div className="spinner"><CircularProgress size={24} className={className} /></div>;