import {
    useQuery,
    gql
} from "@apollo/client";

const QUERY_USERS = gql`
    query{
        users {
            id
            firstName
            lastName
        }
    }
`;

const Users = () => {
    const { data, loading } = useQuery(
        QUERY_USERS, {
        pollInterval: 1000
    }
    );

    if (loading) return <p>Loading</p>;
    console.log(data.users)
    return (
        <div>

            {data && data.users.map((__typename: string, id: number, firstName: string, lastName: string) => {
                return (
                    <div key={id}>
                        {firstName} {lastName}
                    </div>
                )
            })
            }

        </div>
    )
};

export default Users;