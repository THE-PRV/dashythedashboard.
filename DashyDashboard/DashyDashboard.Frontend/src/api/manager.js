import { get, post, put } from './client.js';
import { routePart } from '../lib/contracts.js';

export const getAllUsers = () => get('/api/manager/users');
export const getTeam = (cycleId) => get(`/api/manager/team?cycleId=${cycleId}`);
export const getMemberDetail = (memberId, cycleId) =>
  get(`/api/manager/team/${routePart(memberId)}?cycleId=${cycleId}`);

export const getMemberAccess = (memberId) =>
  get(`/api/manager/team/${routePart(memberId)}/access`);

export const grantAccess = (memberId, data) =>
  post(`/api/manager/team/${routePart(memberId)}/access`, data);

export const revokeAccess = (memberId, clientId, toolId) =>
  put(`/api/manager/team/${routePart(memberId)}/access/${routePart(clientId)}/${routePart(toolId)}/revoke`);

// accessTo: 'yyyy-MM-dd' to set an end date, or null to clear it (make open-ended).
export const updateAccessEndDate = (memberId, clientId, toolId, accessTo) =>
  put(`/api/manager/team/${routePart(memberId)}/access/${routePart(clientId)}/${routePart(toolId)}/end-date`, { accessTo });

export const getClientsAndTools = () => get('/api/manager/clients-tools');

export const generateNextCycle = () => post('/api/manager/cycles/generate-next');
