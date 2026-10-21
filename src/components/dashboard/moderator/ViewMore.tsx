"use client"
import {ArrowRight} from "iconsax-react"

export default function ViewMore() {
    return <div>
        <div className="flex gap-2">
            <p className="text-sm text-des">view more</p>
            <ArrowRight color="gray" size = {15}/>
        </div>
    </div>
}