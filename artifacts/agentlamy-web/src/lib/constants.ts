import { Scale, Globe, FileText, ShieldCheck, Briefcase, Building2 } from "lucide-react";
import React from "react";

export const C = {
  blue:    "#0071e3",
  blueDk:  "#0077ed",
  dark:    "#1d1d1f",
  gray:    "#6e6e73",
  grayLt:  "#f5f5f7",
  white:   "#ffffff",
  border:  "#d2d2d7",
  green:   "#34c759",
};

export const SYS = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Helvetica, Arial, sans-serif`;

export const services = [
  { icon: React.createElement(Scale, { size: 22 }), label: "Patents", desc: "Utility, design & provisional applications" },
  { icon: React.createElement(Globe, { size: 22 }), label: "Trademarks", desc: "Registration, monitoring & enforcement" },
  { icon: React.createElement(FileText, { size: 22 }), label: "Contracts", desc: "Drafting, review & negotiation support" },
  { icon: React.createElement(ShieldCheck, { size: 22 }), label: "Privacy & Compliance", desc: "GDPR, CCPA & data governance" },
  { icon: React.createElement(Briefcase, { size: 22 }), label: "Startup Docs", desc: "Cap tables, SAFEs & term sheets" },
  { icon: React.createElement(Building2, { size: 22 }), label: "Business Formation", desc: "LLC, Corp & partnership structures" },
];

export const practiceAreas = [
  "Intellectual Property",
  "Corporate Law",
  "Employment Law",
  "Real Estate",
  "Immigration",
  "Tax Law",
  "Litigation Support",
  "Securities",
];
