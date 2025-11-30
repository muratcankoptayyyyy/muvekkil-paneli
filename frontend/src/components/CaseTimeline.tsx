import React, { useState } from 'react'
import { CaseStage, TimelineEvent } from '../types'
import { CheckCircle, Circle, Clock, Calendar, FileText, Gavel } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface CaseTimelineProps {
  stages: CaseStage[]
  events: TimelineEvent[]
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ stages, events }) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    stages.find(s => s.status === 'current')?.id || stages[0]?.id || null
  )

  const getStageIcon = (status: CaseStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'current':
        return <Clock className="w-6 h-6 text-blue-500" />
      default:
        return <Circle className="w-6 h-6 text-gray-300" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'HEARING':
        return <Gavel className="w-4 h-4" />
      case 'REPORT':
        return <FileText className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const selectedStageEvents = events.filter(
    event => event.stage_id === selectedStageId
  ).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())

  if (!stages || stages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Henüz bir aşama tanımlanmamış.
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Stages Stepper */}
      <div className="relative flex items-center justify-between w-full mb-8 overflow-x-auto pb-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2" />
        
        {stages.sort((a, b) => a.order - b.order).map((stage) => (
          <div 
            key={stage.id}
            className={`flex flex-col items-center cursor-pointer min-w-[100px] ${
              selectedStageId === stage.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => setSelectedStageId(stage.id)}
          >
            <div className={`bg-white p-1 rounded-full ${
              selectedStageId === stage.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}>
              {getStageIcon(stage.status)}
            </div>
            <span className={`mt-2 text-sm font-medium ${
              selectedStageId === stage.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {stage.title}
            </span>
          </div>
        ))}
      </div>

      {/* Selected Stage Details */}
      {selectedStageId && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {stages.find(s => s.id === selectedStageId)?.title} Detayları
          </h3>
          
          {selectedStageEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedStageEvents.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full text-blue-600">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(event.event_date), 'd MMMM yyyy', { locale: tr })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Bu aşama için henüz bir kayıt bulunmuyor.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CaseTimeline