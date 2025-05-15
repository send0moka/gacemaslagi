import React from "react"

interface ArrowLongProps {
  className?: string
  fill?: string
}

const ArrowLong = ({ className, fill }: ArrowLongProps) => {
  return (
    <svg
      className={className}
      width="50"
      height="8"
      viewBox="0 0 50 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 3.5C0.723858 3.5 0.5 3.72386 0.5 4C0.5 4.27614 0.723858 4.5 1 4.5V3.5ZM49.3536 4.35355C49.5488 4.15829 49.5488 3.84171 49.3536 3.64645L46.1716 0.464466C45.9763 0.269204 45.6597 0.269204 45.4645 0.464466C45.2692 0.659728 45.2692 0.976311 45.4645 1.17157L48.2929 4L45.4645 6.82843C45.2692 7.02369 45.2692 7.34027 45.4645 7.53553C45.6597 7.7308 45.9763 7.7308 46.1716 7.53553L49.3536 4.35355ZM1 4V4.5H49V4V3.5H1V4Z"
        fill={fill}
      />
    </svg>
  )
}

export default ArrowLong
