import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ShieldIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="M12 3 5 6.2v5.2c0 4.4 2.8 7.5 7 9.6 4.2-2.1 7-5.2 7-9.6V6.2L12 3Z" /><path {...strokeProps} d="m9.2 12 1.8 1.8 3.9-4" /></Icon>;
}

export function CopyIcon(props: IconProps) {
  return <Icon {...props}><rect {...strokeProps} x="8" y="8" width="11" height="11" rx="2.5" /><path {...strokeProps} d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></Icon>;
}

export function ArrowUpRightIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="M7 17 17 7M8 7h9v9" /></Icon>;
}

export function GaugeIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="M4.2 17a9 9 0 1 1 15.6 0" /><path {...strokeProps} d="m12 14 4-4" /><path {...strokeProps} d="M7 17h10" /></Icon>;
}

export function DevicesIcon(props: IconProps) {
  return <Icon {...props}><rect {...strokeProps} x="3" y="5" width="13" height="10" rx="2" /><path {...strokeProps} d="M8 19h3m-1.5-4v4" /><rect {...strokeProps} x="17" y="9" width="4" height="9" rx="1" /></Icon>;
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="m5 12 4.2 4.2L19 6.5" /></Icon>;
}

export function LockIcon(props: IconProps) {
  return <Icon {...props}><rect {...strokeProps} x="5" y="10" width="14" height="10" rx="3" /><path {...strokeProps} d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>;
}

export function WalletIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11H6.5A2.5 2.5 0 0 1 4 15.5v-8Z" /><path {...strokeProps} d="M4 8h14.5A1.5 1.5 0 0 1 20 9.5V12h-4a2 2 0 0 0 0 4h4" /></Icon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="m9 5 7 7-7 7" /></Icon>;
}

export function SparkIcon(props: IconProps) {
  return <Icon {...props}><path {...strokeProps} d="M12 3c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7Z" /><path {...strokeProps} d="M19 16c.2 1.7 1 2.5 2.7 2.7-1.7.2-2.5 1-2.7 2.7-.2-1.7-1-2.5-2.7-2.7 1.7-.2 2.5-1 2.7-2.7Z" /></Icon>;
}
