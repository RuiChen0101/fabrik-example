import {
    Location,
    NavigateFunction,
    Params,
    useLocation,
    useNavigate,
    useParams,
    useSearchParams
} from 'react-router-dom'

export interface WithNavigatorProps {
    navigate: NavigateFunction;
    location: Location;
    match: Params<string>;
    searchParams: URLSearchParams;
}

export const withNavigator = (Component: any) => {
    const Wrapper = (props: any) => {
        const navigate = useNavigate();
        const location = useLocation();
        const searchParams = useSearchParams()[0];
        const param = useParams();

        return (
            <Component
                navigate={navigate}
                searchParams={searchParams}
                match={param}
                location={location}
                {...props}
            />
        );
    };

    return Wrapper;
}
