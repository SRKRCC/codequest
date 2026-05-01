"use client"

import { useEffect, useState } from "react"

/**
 * A hook for implementing partial rendering of components
 * @param delay - Optional delay in ms before rendering the component
 * @returns An object with isReady flag indicating if the component should render
 */
export function usePartialRendering(delay = 0) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true)
        }, delay)

        return () => clearTimeout(timer)
    }, [delay])

    return { isReady }
}

