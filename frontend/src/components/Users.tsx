import {
    useQuery,
    gql
} from "@apollo/client";
import { UserType } from '../generated/graphql';

const userQuery = gql`
    query{
        users {
            id
            firstName
            lastName
        }
    }
`;

const Users = () => {
    const { loading, error, data } = useQuery(
        userQuery, {
        pollInterval: 2000
    });
    if (loading) return <p>Loading</p>;
    if (error) return <p>Error! ${error.message}</p>;
    console.log(data.users)
    return (
        <div>

            {data && data.users.map((user: UserType) => {
                return (
                    <div key={user.id}>
                        {user.firstName} {user.lastName}
                    </div>
                )
            })}

        </div>
    )
};

export default Users;