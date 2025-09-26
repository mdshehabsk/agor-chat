import { useMutation, useQuery } from "@tanstack/react-query";
import Axios from "../Axios";
import { IAgoraUserEntity, IUserSigninResponse } from "./user.types";


export const useGetUsers = () => useQuery<IAgoraUserEntity[]>({
    queryKey : ['users'],
    queryFn : () => Axios.get("/users")
})

export const useGetUser = (username: string) => useQuery<IAgoraUserEntity,unknown>({
    queryKey : ['user'],
    queryFn : () => Axios.get(`/user/${username}`),
    enabled : !!username
})

export const useSigninUser = () => useMutation<IUserSigninResponse,unknown,string>({
    mutationFn : (username) => Axios.post(`/signin`, {username} )
})