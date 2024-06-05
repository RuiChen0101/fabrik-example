import { Suspense } from "react";

export const withSuspense = (Component: any) => {
    const Wrapper = (props: any) => {
        return (
            <Suspense fallback={<>...</>}>
                <Component
                    {...props}
                />
            </Suspense>

        );
    };

    return Wrapper;
}