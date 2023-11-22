import { useAccount, useContractWrite } from 'wagmi';
import { readContract } from '@wagmi/core';
import {
  Address,
  decodeFunctionResult,
  encodeFunctionData,
  getAbiItem,
  getFunctionSelector,
  parseEther,
} from 'viem';
import { AlertColor } from '@mui/material/Alert';

import { Task } from '@/models/task';
import { UserRole } from '@/models/user';
import { useSnackBar } from '@/contexts/SnackBarContext';
import { WEB3TASK_CONTRACT_ADDRESS, web3taskABI } from '@/contracts/web3taskABI';

export function useTaskService() {
  const { address: userAddress } = useAccount();
  const { showSnackBar } = useSnackBar();

  const createTaskMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'createTask',
  });
  const startTaskMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'startTask',
  });
  const reviewTaskMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'reviewTask',
  });
  const completeTaskMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'completeTask',
  });
  const cancelTaskMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'cancelTask',
  });
  const setRoleMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'setRole',
  });
  const setOperatorMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'setOperator',
  });
  const setMinQuorumMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'setMinQuorum',
  });
  const depositMutation = useContractWrite({
    address: WEB3TASK_CONTRACT_ADDRESS,
    abi: web3taskABI,
    functionName: 'deposit',
  });

  const handleSnackbar = (message: string, color: AlertColor) => {
    showSnackBar(message, color);
  };

  async function createTask(task: Task) {
    try {
      const isLeader = !!userAddress && (await hasLeaderRole(userAddress));

      if (!isLeader) {
        throw new Error('User does not have the leader role!');
      }

      const createTaskInterfaceID = getFunctionSelector(
        getAbiItem({
          abi: web3taskABI,
          name: 'createTask',
        })
      );

      const isOperator = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'isOperator',
        args: [createTaskInterfaceID, BigInt(UserRole.Leader)],
      });

      if (!isOperator) {
        throw new Error('User unauthorized to perform createTask!');
      }

      await createTaskMutation.writeAsync({
        args: [task],
      });
    } catch (error) {
      if (error instanceof Error) {
        handleSnackbar(error.message, 'error');
      } else {
        handleSnackbar('Unexpected error', 'error');
      }
    }
  }

  async function startTask(id: bigint) {
    try {
      const isLeader = !!userAddress && (await hasLeaderRole(userAddress));
      const startTaskInterfaceID = getFunctionSelector(
        getAbiItem({
          abi: web3taskABI,
          name: 'startTask',
        })
      );

      if (isLeader) {
        const isOperator = await readContract({
          address: WEB3TASK_CONTRACT_ADDRESS,
          abi: web3taskABI,
          functionName: 'isOperator',
          args: [startTaskInterfaceID, BigInt(UserRole.Leader)],
        });

        if (!isOperator) {
          throw Error('User unauthorized to perform startTask!');
        }

        await startTaskMutation.writeAsync({
          args: [id, BigInt(UserRole.Leader)],
        });

        return;
      }

      const isOperator = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'isOperator',
        args: [startTaskInterfaceID, BigInt(UserRole.Member)],
      });

      if (!isOperator) {
        throw Error('User unauthorized to perform startTask!');
      }

      await startTaskMutation.writeAsync({
        args: [id, BigInt(UserRole.Member)],
      });
    } catch (error) {
      if (error instanceof Error) {
        handleSnackbar(error.message, 'error');
      } else {
        handleSnackbar('Unexpected error', 'error');
      }
    }
  }

  async function reviewTask(id: bigint, metadata = '') {
    try {
      const isLeader = !!userAddress && (await hasLeaderRole(userAddress));

      if (!userAddress || !isLeader) {
        throw new Error('User does not have the leader role!');
      }

      const reviewTaskInterfaceID = getFunctionSelector(
        getAbiItem({
          abi: web3taskABI,
          name: 'reviewTask',
        })
      );

      const isOperator = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'isOperator',
        args: [reviewTaskInterfaceID, BigInt(UserRole.Leader)],
      });

      if (!isOperator) {
        throw Error('User unauthorized to perform reviewTask!');
      }

      reviewTaskMutation.writeAsync({
        args: [id, BigInt(UserRole.Leader), metadata],
      });
    } catch (error) {
      if (error instanceof Error) {
        handleSnackbar(error.message, 'error');
      } else {
        handleSnackbar('Unexpected error', 'error');
      }
    }
  }

  async function completeTask(id: bigint) {
    try {
      const isLeader = !!userAddress && (await hasLeaderRole(userAddress));

      if (!isLeader) {
        throw new Error('User does not have the leader role!');
      }

      const completeTaskInterfaceID = getFunctionSelector(
        getAbiItem({
          abi: web3taskABI,
          name: 'completeTask',
        })
      );

      const isOperator = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'isOperator',
        args: [completeTaskInterfaceID, BigInt(UserRole.Leader)],
      });

      if (!isOperator) {
        throw Error('User unauthorized to perform completeTask!');
      }

      completeTaskMutation.writeAsync({
        args: [id, BigInt(UserRole.Leader)],
      });
    } catch (error) {
      if (error instanceof Error) {
        handleSnackbar(error.message, 'error');
      } else {
        handleSnackbar('Unexpected error', 'error');
      }
    }
  }

  async function cancelTask(id: bigint) {
    try {
      const isLeader = !!userAddress && (await hasLeaderRole(userAddress));

      if (!isLeader) {
        throw new Error('User does not have the leader role!');
      }

      const cancelTaskInterfaceID = getFunctionSelector(
        getAbiItem({
          abi: web3taskABI,
          name: 'cancelTask',
        })
      );

      const isOperator = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'isOperator',
        args: [cancelTaskInterfaceID, BigInt(UserRole.Leader)],
      });

      if (!isOperator) {
        throw Error('User unauthorized to perform cancelTask!');
      }

      cancelTaskMutation.writeAsync({
        args: [id, BigInt(UserRole.Leader)],
      });
    } catch (error) {
      if (error instanceof Error) {
        handleSnackbar(error.message, 'error');
      } else {
        handleSnackbar('Unexpected error', 'error');
      }
    }
  }

  async function getTask(taskId: bigint) {
    try {
      return readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'getTask',
        args: [taskId],
      });
    } catch (error) {
      handleSnackbar(`Error searching task id: ${taskId}`, 'error');
    }
  }

  async function getMultiTasks(
    min: number,
    max: number,
    isUserProfile: boolean
  ) {
    /// Prepare the encoding of data and submit it to the contract
    const payloadArray: Address[] = [];
    let taskIds: readonly bigint[] = [];

    if (!userAddress) {
      throw new Error('User address not found');
    }

    if (isUserProfile) {
      taskIds = await readContract({
        address: WEB3TASK_CONTRACT_ADDRESS,
        abi: web3taskABI,
        functionName: 'getUserTasks',
        args: [userAddress],
      });

      if (taskIds && taskIds.length > 0) {
        for (var i = 0; i < taskIds.length; i++) {
          let id = Number(taskIds[i]);
          payloadArray.push(
            encodeFunctionData({
              // @ts-ignore
              abi: web3taskABI,
              name: 'getTask',
              args: [BigInt(id)],
            })
          );
        }
      }
    } else {
      for (var i = min; i <= max; i++) {
        payloadArray.push(
          encodeFunctionData({
            // @ts-ignore
            abi: web3taskABI,
            name: 'getTask',
            args: [BigInt(i)],
          })
        );
      }
    }

    const response = await readContract({
      address: WEB3TASK_CONTRACT_ADDRESS,
      abi: web3taskABI,
      functionName: 'multicallRead',
      args: [payloadArray],
    });

    /// Decode the results
    let decodedResults = [];
    /// Get the sighash of the function
    // let getTaskID = tasksManagerContract.interface.getSighash("getTask(uint256)");

    // const getTaskInterfaceID = getFunctionSelector(
    //   getAbiItem({
    //     abi: web3taskABI,
    //     name: 'getTask',
    //   })
    // );

    /// Map the results to the function name and the decoded arguments
    decodedResults = response.map((res: any) => {
      try {
        const decodedArgs = decodeFunctionResult({
          abi: web3taskABI,
          functionName: 'getTask',
          data: res,
        });

        return {
          name: getAbiItem({
            abi: web3taskABI,
            name: 'getTask',
          }).name,
          args: decodedArgs,
        };
      } catch (error) {
        console.log('Could not decode result', error);
      }
    });

    return decodedResults;
  }

  async function setRole(
    roleId: bigint,
    authorizedAddress: Address,
    isAuthorized: boolean
  ) {
    try {
      return setRoleMutation.writeAsync({
        args: [roleId, authorizedAddress, isAuthorized],
      });
    } catch (error) {
      handleSnackbar(
        `Error setting role id ${roleId} to address ${authorizedAddress}`,
        'error'
      );
    }
  }

  async function setOperator(
    interfaceId: Address,
    roleId: bigint,
    isAuthorized: boolean
  ) {
    try {
      return setOperatorMutation.writeAsync({
        args: [interfaceId, roleId, isAuthorized],
      });
    } catch (error) {
      handleSnackbar(
        `Error setting operator to interface id ${interfaceId}, role id ${roleId}`,
        'error'
      );
    }
  }

  async function setMinQuorum(quorum: bigint) {
    try {
      return setMinQuorumMutation.writeAsync({
        args: [quorum],
      });
    } catch (error) {
      handleSnackbar(`Error setting quorum ${quorum}`, 'error');
    }
  }

  async function deposit(roleId: bigint, amount: string) {
    try {
      return depositMutation.writeAsync({
        args: [roleId],
        value: parseEther(amount),
      });
    } catch (error) {
      handleSnackbar(
        `Error setting deposit for role id ${roleId} of amount ${amount}`,
        'error'
      );
    }
  }

  async function hasLeaderRole(address: Address) {
    const hasRole = await readContract({
      address: WEB3TASK_CONTRACT_ADDRESS,
      abi: web3taskABI,
      functionName: 'hasRole',
      args: [BigInt(UserRole.Leader), address],
    });

    return hasRole;
  }

  async function hasMemberRole(address: Address) {
    const hasRole = await readContract({
      address: WEB3TASK_CONTRACT_ADDRESS,
      abi: web3taskABI,
      functionName: 'hasRole',
      args: [BigInt(UserRole.Member), address],
    });

    return hasRole;
  }

  return {
    createTask,
    startTask,
    reviewTask,
    completeTask,
    cancelTask,
    getTask,
    getMultiTasks,
    setRole,
    setOperator,
    hasLeaderRole,
    hasMemberRole,
    setMinQuorum,
    deposit,
  };
}
