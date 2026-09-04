import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type AsyncButtonProps = React.ComponentProps<typeof Button> & {
  isLoading?: boolean
}

function AsyncButton({
  children,
  disabled,
  isLoading = false,
  ...props
}: AsyncButtonProps) {
  return (
    <Button disabled={disabled || isLoading} aria-busy={isLoading} {...props}>
      {isLoading ? <Spinner aria-label="Cargando" /> : children}
    </Button>
  )
}

export { AsyncButton }
