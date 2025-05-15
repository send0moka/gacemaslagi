import React from "react"

interface NegativeCornerProps {
  className?: string
  fill?: string
}

const NegativeCorner = ({ className, fill }: NegativeCornerProps) => {
  return (
    <svg
      className={className}
      width="17"
      height="18"
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.00683594 0.00683594C0.00230255 0.170671 0 0.335069 0 0.5C0 9.99512 7.56208 17.7225 16.9922 17.9912L17 18H0V0L0.00683594 0.00683594Z"
        fill={fill}
      />
    </svg>
  )
}

export default NegativeCorner
