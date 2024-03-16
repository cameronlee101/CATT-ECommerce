"use client"

import { Card, CardBody } from "@nextui-org/react"
import React from 'react'
import { PriceFilter } from "./PriceFilter"

export function Filters() {
  return (
    <Card
      className="w-80"
      style={{ height: "800px" }}
    >
      <CardBody className="flex flex-col align-middle text-center">
        <PriceFilter
          min={1}
          max={100}
          onChange={() => {}}
        />
      </CardBody>
    </Card>
  )
}
