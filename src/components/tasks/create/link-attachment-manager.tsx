'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Link, FileText, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Link {
  url: string
  description: string
}

interface Attachment {
  name: string
  url: string
  size?: number
}

interface LinkAttachmentManagerProps {
  links: Link[]
  attachments: Attachment[]
  onLinksChange: (links: Link[]) => void
  onAttachmentsChange: (attachments: Attachment[]) => void
}

export function LinkAttachmentManager({
  links,
  attachments,
  onLinksChange,
  onAttachmentsChange,
}: LinkAttachmentManagerProps) {
  const [newLink, setNewLink] = useState({ url: '', description: '' })
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' })
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [showAttachmentForm, setShowAttachmentForm] = useState(false)

  const addLink = () => {
    if (newLink.url && newLink.description && links.length < 5) {
      onLinksChange([...links, newLink])
      setNewLink({ url: '', description: '' })
      setShowLinkForm(false)
    }
  }

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index))
  }

  const addAttachment = () => {
    if (newAttachment.name && newAttachment.url && attachments.length < 10) {
      onAttachmentsChange([...attachments, newAttachment])
      setNewAttachment({ name: '', url: '' })
      setShowAttachmentForm(false)
    }
  }

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link className="h-5 w-5" />
            Links de Referência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Links existentes */}
          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {link.description}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {link.url}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulário para adicionar link */}
          {showLinkForm ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="link-description">Descrição</Label>
                <Input
                  id="link-description"
                  placeholder="Ex: Design de referência"
                  value={newLink.description}
                  onChange={(e) =>
                    setNewLink({ ...newLink, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={addLink}
                  disabled={!newLink.url || !newLink.description}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLinkForm(true)}
              disabled={links.length >= 5}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Link ({links.length}/5)
            </Button>
          )}

          {links.length >= 5 && (
            <Alert>
              <AlertDescription>
                Máximo de 5 links atingido. Remova um link para adicionar outro.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Anexos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Anexos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Anexos existentes */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {attachment.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {attachment.url}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulário para adicionar anexo */}
          {showAttachmentForm ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <div>
                <Label htmlFor="attachment-name">Nome do Arquivo</Label>
                <Input
                  id="attachment-name"
                  placeholder="Ex: design-mockup.figma"
                  value={newAttachment.name}
                  onChange={(e) =>
                    setNewAttachment({ ...newAttachment, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="attachment-url">URL do Arquivo</Label>
                <Input
                  id="attachment-url"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newAttachment.url}
                  onChange={(e) =>
                    setNewAttachment({ ...newAttachment, url: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={addAttachment}
                  disabled={!newAttachment.name || !newAttachment.url}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Anexo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAttachmentForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAttachmentForm(true)}
              disabled={attachments.length >= 10}
            >
              <Upload className="h-4 w-4 mr-1" />
              Adicionar Anexo ({attachments.length}/10)
            </Button>
          )}

          {attachments.length >= 10 && (
            <Alert>
              <AlertDescription>
                Máximo de 10 anexos atingido. Remova um anexo para adicionar
                outro.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            <p>• Suporte para links do Google Drive, Dropbox, Figma, etc.</p>
            <p>
              • Certifique-se de que os arquivos estão acessíveis publicamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
