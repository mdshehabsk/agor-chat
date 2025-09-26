import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Axios from "../Axios";
import useUserState from "@/state/useUserState";
import { ICreateMessage, IMessage } from "./message.types";

export const useGetMessages = (username: string) => {
  const userId = useUserState((state) => state?.userId);
  return useQuery<IMessage[]>({
    queryKey: ["messages"],
    queryFn: () =>
      Axios.get(`/message/${username}`, {
        headers: {
          Authorization: userId,
        },
      }),
    enabled: !!username && !!userId ,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<IMessage, unknown, ICreateMessage>({
    mutationKey: ['create-message'],
    mutationFn: (data) => Axios.post("/message", data).then(res => res.data),
    
    // Optimistic update
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<IMessage[]>(['messages']);

      // Optimistically update the cache
      if (previousMessages) {
        queryClient.setQueryData<IMessage[]>(['messages'], [
          ...previousMessages,
          {
            ...newMessage,
            uuid: newMessage.uuid || 'temp-id-' + Date.now(), // temporary id if not generated
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }

      // Return context with previous messages in case we need to rollback
      return { previousMessages };
    },

    // If the mutation fails, roll back
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages'], context.previousMessages);
      }
    },

    // After mutation succeeds or fails, refetch the messages
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};