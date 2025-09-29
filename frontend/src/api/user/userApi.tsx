import { useMutation } from "@tanstack/react-query";
import Axios from "../Axios";
import {  IUserSigninResponse, IUserSignupPayload } from "./user.types";



export const useSigninUser = () => useMutation<IUserSigninResponse,unknown,string>({
    mutationFn : (username) => Axios.post(`/signin`, {username} )
})

export const useSignupUser = () => useMutation<unknown,unknown,IUserSignupPayload>({
    mutationFn : (data) => Axios.post(`/signup`, data)
})