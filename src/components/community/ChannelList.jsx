import React, { useState } from "react";
import { useServerVoice } from "@/hooks/useServerVoice";
import SpeakingRing from "@/components/community/SpeakingRing";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Hash, Volume2, Megaphone, MessageSquare, Folder, ChevronDown, ChevronRight, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_TYPES = [
  { key: "text", icon: Hash },
  { key: "voice", icon: Volume2 },
  { key: "announce", icon: Megaphone },
  { key: "forum", icon: MessageSquare },
  { key: "category", icon: Folder },
];

export default function ChannelList({ channels, activeChannel, setActiveChannel, canManage, theme, onReorder, onRemove, onContextMenu, serverId }) {
  const [collapsed, setCollapsed] = useState({});

  // Live voice rooms for this server (realtime) + who is speaking
  const { rooms: voiceRooms, speakingEmails } = useServerVoice(serverId);

  const getParticipantsForChannel = (channelId) => {
    const room = voiceRooms.find((r) => r.channel_id === channelId);
    return room?.participants || [];
  };

  const allChannels = channels?.length ? channels : [];
  const categories = allChannels.filter(c => c.type === "category");
  const uncategorized = allChannels.filter(c => c.type !== "category" && !c.category_id);

  const getChannelsForCategory = (catId) => allChannels.filter(c => c.category_id === catId);

  const toggleCollapse = (catId) => {
    setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination || !canManage) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newChannels = [...allChannels];
    const draggedIdx = newChannels.findIndex(c => c.id === draggableId);
    if (draggedIdx === -1) return;
    const [moved] = newChannels.splice(draggedIdx, 1);

    if (destination.droppableId === "uncategorized") {
      moved.category_id = null;
    } else {
      moved.category_id = destination.droppableId.replace("cat-", "");
    }

    let insertIdx;
    if (destination.droppableId === "uncategorized") {
      const uncategorizedChannels = newChannels.filter(c => c.type !== "category" && !c.category_id);
      if (destination.index < uncategorizedChannels.length && uncategorizedChannels[destination.index]) {
        insertIdx = newChannels.findIndex(c => c.id === uncategorizedChannels[destination.index].id);
      } else if (uncategorizedChannels.length > 0) {
        insertIdx = newChannels.findIndex(c => c.id === uncategorizedChannels[uncategorizedChannels.length - 1].id) + 1;
      } else {
        insertIdx = newChannels.length;
      }
    } else {
      const catId = destination.droppableId.replace("cat-", "");
      const catChannels = newChannels.filter(c => c.category_id === catId);
      if (catChannels.length === 0) {
        const catIdx = newChannels.findIndex(c => c.id === catId);
        insertIdx = catIdx + 1;
      } else if (destination.index < catChannels.length && catChannels[destination.index]) {
        insertIdx = newChannels.findIndex(c => c.id === catChannels[destination.index].id);
      } else {
        insertIdx = newChannels.findIndex(c => c.id === catChannels[catChannels.length - 1].id) + 1;
      }
    }

    newChannels.splice(insertIdx, 0, moved);
    onReorder(newChannels);
  };

  const renderChannel = (ch, index) => {
    const TypeIcon = CHANNEL_TYPES.find(t => t.key === ch.type)?.icon || Hash;
    const isActive = activeChannel?.id === ch.id;
    const voiceParticipants = ch.type === "voice" ? getParticipantsForChannel(ch.id) : [];
    return (
      <Draggable key={ch.id} draggableId={ch.id} index={index} isDragDisabled={!canManage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(
              "rounded-xl cursor-pointer group transition",
              isActive ? "text-white" : "text-muted-foreground hover:text-white",
              snapshot.isDragging && "ring-1 ring-primary/50 bg-secondary"
            )}
            style={{
              ...provided.draggableProps.style,
              ...(isActive ? { background: theme.accent + "30" } : {}),
            }}
            onClick={() => setActiveChannel(ch)}
          >
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              {canManage && (
                <span {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing shrink-0">
                  <GripVertical className="w-3 h-3" />
                </span>
              )}
              <TypeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-semibold truncate flex-1">{ch.name}</span>
              {ch.is_nsfw && <span className="text-[8px] font-bold text-red-400">NSFW</span>}
              {voiceParticipants.length > 0 && (
                <span className="text-[9px] font-bold text-green-400 shrink-0">{voiceParticipants.length}</span>
              )}
              {canManage && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(ch.id); }}
                  className="opacity-0 group-hover:opacity-100 transition hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Voice participants list */}
            {voiceParticipants.length > 0 && (
              <div className="ml-5 mr-2 mb-1 space-y-0.5">
                {voiceParticipants.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-0.5">
                    <div className="relative shrink-0">
                      <SpeakingRing speaking={speakingEmails.has((p.email || "").toLowerCase())} width={1.5} />
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white overflow-hidden"
                        style={{ background: p.avatar ? "transparent" : theme.accent + "40" }}>
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (p.name || "?")[0].toUpperCase()
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-white/50 truncate flex-1">{p.name}</span>
                    {!p.micOn && <span className="text-[8px]">🔇</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar"
        onContextMenu={onContextMenu}
      >
        {/* Categories */}
        {categories.map(cat => {
          const catChannels = getChannelsForCategory(cat.id);
          const isCollapsed = collapsed[cat.id];
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCollapse(cat.id)}
                className="w-full flex items-center gap-1 px-1.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
                <Folder className="w-3 h-3 shrink-0" />
                <span className="truncate flex-1 text-left">{cat.name}</span>
              </button>
              {!isCollapsed && (
                <Droppable droppableId={`cat-${cat.id}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn("ml-2 space-y-0.5 min-h-[8px] rounded-lg transition", snapshot.isDraggingOver && "bg-white/5")}
                    >
                      {catChannels.map((ch, i) => renderChannel(ch, i))}
                      {provided.placeholder}
                      {catChannels.length === 0 && (
                        <p className="text-[9px] text-muted-foreground/50 px-2 py-1">Glisse un salon ici</p>
                      )}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          );
        })}

        {/* Uncategorized section */}
        {categories.length > 0 && uncategorized.length > 0 && (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1.5 py-1 pt-2">Autres salons</p>
        )}
        <Droppable droppableId="uncategorized">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn("space-y-0.5 min-h-[8px] rounded-lg transition", snapshot.isDraggingOver && "bg-white/5")}
            >
              {uncategorized.map((ch, i) => renderChannel(ch, i))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}