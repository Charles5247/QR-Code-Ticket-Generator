import React from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import Chart from "chart.js/auto";
import { Html5Qrcode } from "html5-qrcode";
import jsPDF from "jspdf";
import QRCode from "qrcode";

window.React = React;
window.ReactDOM = ReactDOM;
window.supabase = { createClient };
window.Chart = Chart;
window.Html5Qrcode = Html5Qrcode;
window.jsPDF = jsPDF;
window.QRCode = QRCode;
