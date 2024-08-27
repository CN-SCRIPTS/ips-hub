local QBCore = exports['qb-core']:GetCoreObject()
local phub = false

AddEventHandler('onResourceStart', function(resource)
    if resource == GetCurrentResourceName() then
        Playerjob = QBCore.Functions.GetPlayerData().job
        if Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
            TriggerServerEvent('Hub-policehub:server:update')
        end
        createCommand()
    end
end)

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    if Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
        TriggerServerEvent('Hub-policehub:server:update')
    end
    createCommand()
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    if not Config.Jobs[JobInfo.name] or QBCore.Functions.GetPlayerData().job.name ~= JobInfo.name then
        if phub then
            phub = not phub
            SendNUIMessage({
                action = 'Uiopen',
                boolean = false,
            })
        end
    end
    if Config.Jobs[JobInfo.name] then
        TriggerServerEvent('Hub-policehub:server:update')
    end
    createCommand()
end)

AddEventHandler('QBCore:Client:OnPlayerUnload', function()
    if Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
        TriggerServerEvent('Hub-policehub:server:update')
    end
end)



RegisterNUICallback('closehub', function(data, cb)
    if phub then
        SetNuiFocus(false, false)
    end
    cb(true)
end)


RegisterNUICallback('ToggleFoucs', function(data, cb)
    if phub then
        SetNuiFocus(false, false)
    end
    cb(true)
end)

RegisterCommand('ToggleFoucs', function()
    if phub and Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
        SetNuiFocus(phub, phub)
    end
end, false)

RegisterKeyMapping('ToggleFoucs', 'Toggle Police Hub Foucs', 'keyboard', "F11")

RegisterNetEvent('Hub-policehub:client:updateHub', function()
    local PlayersOnJob = {}
    QBCore.Functions.TriggerCallback('Hub-policehub:server:getPolice', function(data)
        for k, v in pairs(data) do
            PlayersOnJob[#PlayersOnJob + 1] = {
                id = v.id,
                callsign = v.callsign,
                name = v.name,
                radio = v.radio,
                talking = NetworkIsPlayerTalking(PlayerId()),
                onduty = v.onduty
            }
            SendNUIMessage({
                action = 'LoadUi',
                officers = PlayersOnJob,
                myData = {
                    Source = 1,
                    Job = QBCore.Functions.GetPlayerData().job.name,
                    Grade = 8,
                    Duty = QBCore.Functions.GetPlayerData().job.onduty,
                },
                title = QBCore.Functions.GetPlayerData().job.label .. ' Hub',
                icon = Config.Jobs[QBCore.Functions.GetPlayerData().job.name].icon,
                cantype = true
            })
        end
    end, QBCore.Functions.GetPlayerData().job.name)
    Wait(250)
end)

RegisterNuiCallback('toggleduty', function()
    TriggerServerEvent('Hub-policehub:server:updatestatus', GetPlayerServerId(PlayerId()))
end)

RegisterNuiCallback('sendmessage', function(data, cb)
    TriggerServerEvent('Hub-policehub:server:sendMessage', data.message, data.type)
    cb(true)
end)

RegisterNuiCallback('deletemessage', function(data, cb)
    TriggerServerEvent('Hub-policehub:server:sendMessage', data.message, data.type)
    cb(true)
end)

RegisterNuiCallback('changecallsign', function(data, cb)
    TriggerServerEvent('Hub-policehub:server:updateSing', data.callsign)
    cb(true)
end)

RegisterNuiCallback('getlocation', function(data, cb)
    QBCore.Functions.TriggerCallback('Hub-policehub:server:GetPlayerCoords', function(callback)
        if callback ~= nil then
            SetNewWaypoint(callback.coords.x, callback.coords.y)
            QBCore.Functions.Notify("Waypoint set to " .. callback.PlayerName .. " !", "success")
        else
            QBCore.Functions.Notify("Player is not online!", "error")
        end
    end, data.source)
    cb(true)
end)

RegisterNuiCallback('joinchannel', function(data, cb)
    QBCore.Functions.TriggerCallback('Hub-policehub:server:GetPlayerRadio', function(radio)
        print(radio)
        exports["pma-voice"]:setRadioChannel(0)
        if not tonumber(radio) or radio == "?" or radio == "0" then
            QBCore.Functions.Notify('This Officer Not In Radio Channel', 'error')
            return
        end
        exports['pma-voice']:addPlayerToRadio(radio, "Radio", "radio")
        QBCore.Functions.Notify("connected to Radio " .. radio .. "!", "success")
    end, data.source)
    cb(true)
end)

RegisterNetEvent('Hub-policehub:client:sendMessage', function(message, job)
    Playerjob = QBCore.Functions.GetPlayerData().job
    if QBCore.Functions.GetPlayerData().job.name == job then
        SendNUIMessage({
            action = 'sendmessage',
            message = message,
            deletegrade = Config.Chat.candelete
        })
    end
end)


function dump(o)
    if type(o) == 'table' then
        local s = '{ '
        for k, v in pairs(o) do
            if type(k) ~= 'number' then k = '' .. k .. '' end
            s = s .. '[' .. k .. '] = ' .. dump(v) .. ','
        end
        return s .. '} '
    else
        return tostring(o)
    end
end

createCommand = function()
    if Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
        RegisterCommand(Config.Jobs[QBCore.Functions.GetPlayerData().job.name].command, function()
            if Config.Jobs[QBCore.Functions.GetPlayerData().job.name] then
                phub = not phub
                SendNUIMessage({
                    action = 'Uiopen',
                    boolean = phub,
                })
            end
        end, false)
        RegisterKeyMapping(Config.Jobs[QBCore.Functions.GetPlayerData().job.name].command, 'Toggle Police Hub Foucs', 'keyboard', "H")
    end
end