import { ForwardedRef, forwardRef } from 'react';

export interface WithForwardRefProps {
    innerRef: ForwardedRef<any>;
}

export const withForwardRef = (Component: any) => {
    const ForwardRef = forwardRef<any, any>((props, ref) => {
        return (
            <Component
                innerRef={ref}
                {...props}
            />
        );
    });

    return ForwardRef;
}
