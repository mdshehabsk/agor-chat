import { useMutation, useQuery } from "@tanstack/react-query";
import Axios from "../Axios";
import {  IAgoraUserEntity, IUserSigninResponse, IUserSignupPayload } from "./user.types";



export const useSigninUser = () => useMutation<IUserSigninResponse,unknown,string>({
    mutationFn : (username) => Axios.post(`/signin`, {username} )
})

export const useSignupUser = () => useMutation<unknown,unknown,IUserSignupPayload>({
    mutationFn : (data) => Axios.post(`/signup`, data)
})

export const useGetUsers = () => useQuery<IAgoraUserEntity[]>({
    queryKey : ["users"],
    queryFn : () => Axios.get(`/users`)
})