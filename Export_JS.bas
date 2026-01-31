Attribute VB_Name = "Export_JS"
' VBA : Export JS enrichi (remplace entièrement l'ancienne macro)
' Génère data_1.js à partir de la feuille "Control dossier"
' Champs ajoutés : errors_count, error_codes, tags, history, has_comment
Option Explicit

Public Sub Export_JS()
    Dim ws As Worksheet
    Set ws = Nothing
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Control dossier")
    On Error GoTo 0
    If ws Is Nothing Then
        MsgBox "Feuille 'Control dossier' introuvable.", vbCritical
        Exit Sub
    End If
    
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "E").End(xlUp).Row
    If lastRow < 10 Then
        MsgBox "Aucune donnée trouvée (ligne de départ 10).", vbExclamation
        Exit Sub
    End If
    
    ' ===== NOM DU FICHIER JS =====
    Dim chemin As String
    ' Modifie le chemin si nécessaire
    chemin = "G:\Web App Nico\En developpement\Suivi de contrôle\data_1.js"
    
    ' Vérifier que le dossier existe
    Dim folderPath As String
    folderPath = Left$(chemin, InStrRev(chemin, "\"))
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    If Not fso.FolderExists(folderPath) Then
        MsgBox "Dossier introuvable : " & folderPath & vbCrLf & "Veuillez vérifier le chemin.", vbCritical
        Exit Sub
    End If
    
    Dim fichier As Object
    On Error Resume Next
    Set fichier = fso.CreateTextFile(chemin, True, True) ' overwrite, unicode
    If Err.Number <> 0 Or fichier Is Nothing Then
        MsgBox "Impossible de créer le fichier : " & chemin, vbCritical
        Err.Clear
        On Error GoTo 0
        Exit Sub
    End If
    On Error GoTo 0
    
    ' ===== DÉBUT DU FICHIER JS =====
    fichier.WriteLine "const data_1 = ["
    
    Dim i As Long
    Dim firstObj As Boolean
    firstObj = True
    
    For i = 10 To lastRow
        Dim rawDate As Variant
        rawDate = ws.Cells(i, "E").Value
        If Trim$(CStr(rawDate)) <> "" Then
            ' Construire liste des codes d'erreur cochés (colonnes 49..200)
            Dim codeList As Collection
            Set codeList = New Collection
            Dim c As Long
            For c = 49 To 200
                On Error Resume Next
                Dim cellVal As Variant
                cellVal = ws.Cells(i, c).Value
                If Not IsEmpty(cellVal) Then
                    If IsNumeric(cellVal) Then
                        If CLng(cellVal) <> 0 Then
                            codeList.Add CStr(c) ' ici on ajoute l'indicateur (col index) ; adapte si tu veux le code réel
                        End If
                    Else
                        ' si texte "1" ou "true"
                        If LCase$(CStr(cellVal)) = "1" Or LCase$(CStr(cellVal)) = "true" Then
                            codeList.Add CStr(c)
                        End If
                    End If
                End If
                On Error GoTo 0
            Next c
            
            ' Construire JSON array pour error_codes (nombres)
            Dim errorCodesJSON As String
            If codeList.Count = 0 Then
                errorCodesJSON = "[]"
            Else
                errorCodesJSON = "[" & JoinCollection(codeList, ",") & "]"
            End If
            
            ' Lire remarque (col AE = 31)
            Dim remarque As String
            remarque = CStr(ws.Cells(i, 31).Text)
            
            ' Extraire tags (éléments entre [ ... ]) depuis la remarque
            Dim tagsJSON As String
            tagsJSON = ExtractTagsJSON(remarque)
            
            ' Histoire (col 47)
            Dim historyTxt As String
            historyTxt = CStr(ws.Cells(i, 47).Text)
            
            ' erreurs_count (col 30) si existante, sinon calcule la longueur de errorCodes
            Dim errorsCount As Long
            If IsNumeric(ws.Cells(i, 30).Value) Then
                errorsCount = CLng(ws.Cells(i, 30).Value)
            Else
                errorsCount = codeList.Count
            End If
            
            ' has_comment : si commentaire (col AE) non vide
            Dim hasComment As Boolean
            hasComment = (Trim$(CStr(ws.Cells(i, "AE").Text)) <> "")
            
            ' Préparer l'objet JS (liste de lignes)
            Dim objLines As Collection
            Set objLines = New Collection
            
            objLines.Add "  {"
            objLines.Add "    date: """ & FormatDateForJS(rawDate) & """"
            objLines.Add "    , cie: """ & EscapeJS(ws.Cells(i, "G").Text) & """"
            objLines.Add "    , vol: """ & EscapeJS(ws.Cells(i, "H").Text) & """"
            ' check : renvoyer true/false (sans guillemets) - CORRECTION: colonne R au lieu de S
            objLines.Add "    , check: " & BoolJS(ws.Cells(i, "R").Value)
            objLines.Add "    , agent: """ & EscapeJS(ws.Cells(i, "T").Text) & """"
            objLines.Add "    , tso: """ & EscapeJS(ws.Cells(i, "U").Text) & """"
            objLines.Add "    , debrief: " & BoolJS(ws.Cells(i, "V").Value)
            objLines.Add "    , commentaire: """ & EscapeJS(ws.Cells(i, "AE").Text) & """"
            objLines.Add "    , errors_count: " & CStr(errorsCount)
            objLines.Add "    , error_codes: " & errorCodesJSON
            objLines.Add "    , tags: " & tagsJSON
            objLines.Add "    , history: """ & EscapeJS(historyTxt) & """"
            objLines.Add "    , has_comment: " & IIf(hasComment, "true", "false")
            objLines.Add "  }"
            
            ' Ecrire dans le fichier (séparateur de virgule entre objets)
            If Not firstObj Then
                fichier.WriteLine ","
            End If
            firstObj = False
            
            Dim idx As Long
            For idx = 1 To objLines.Count
                fichier.WriteLine objLines(idx)
            Next idx
        End If
    Next i
    
    ' ===== FIN DU FICHIER =====
    fichier.WriteLine ""
    fichier.WriteLine "];"
    
    fichier.Close
    
    MsgBox "Fichier JS créé avec succès :" & vbCrLf & chemin, vbInformation
End Sub

' --- Helpers ---

' Formate une valeur date en "yyyy-mm-dd" si possible, sinon renvoie chaîne vide
Private Function FormatDateForJS(val As Variant) As String
    On Error Resume Next
    If IsDate(val) Then
        FormatDateForJS = Format(CDate(val), "yyyy-mm-dd")
    Else
        ' tentatives supplémentaires si format texte
        Dim d As Date
        d = CDate(val)
        If Err.Number = 0 Then
            FormatDateForJS = Format(d, "yyyy-mm-dd")
        Else
            FormatDateForJS = ""
            Err.Clear
        End If
    End If
    On Error GoTo 0
End Function

' Retourne "true"/"false" pour JSON (gère boolean, numeric, texte "true"/"false")
Private Function BoolJS(valeur As Variant) As String
    On Error Resume Next
    If VarType(valeur) = vbBoolean Then
        If CBool(valeur) Then
            BoolJS = "true"
        Else
            BoolJS = "false"
        End If
        Exit Function
    End If
    If IsNumeric(valeur) Then
        If CLng(valeur) <> 0 Then
            BoolJS = "true": Exit Function
        Else
            BoolJS = "false": Exit Function
        End If
    End If
    Dim s As String
    s = LCase$(Trim$(CStr(valeur)))
    If s = "true" Or s = "1" Then
        BoolJS = "true"
    Else
        BoolJS = "false"
    End If
    On Error GoTo 0
End Function

' Échappe les chaînes pour JS (guillemets, backslash et retours à la ligne)
Private Function EscapeJS(txt As String) As String
    If Len(txt) = 0 Then
        EscapeJS = ""
        Exit Function
    End If
    ' remplacer backslash d'abord
    txt = Replace(txt, "\", "\\")
    ' remplacer double quote par \" (on veut les caractères backslash+quote dans le fichier)
    txt = Replace(txt, """", "\""")
    ' supprimer retours à la ligne
    txt = Replace(txt, vbCrLf, " ")
    txt = Replace(txt, vbCr, " ")
    txt = Replace(txt, vbLf, " ")
    ' trim final
    EscapeJS = Trim$(txt)
End Function

' Concatène une Collection de strings avec un séparateur
Private Function JoinCollection(col As Collection, sep As String) As String
    Dim arr() As String
    Dim i As Long

    If col Is Nothing Or col.Count = 0 Then
        JoinCollection = ""
        Exit Function
    End If

    ReDim arr(0 To col.Count - 1)
    For i = 1 To col.Count
        arr(i - 1) = col(i)
    Next i

    JoinCollection = Join(arr, sep)
End Function

' Extrait les tags [TAG] depuis un texte et renvoie un JSON array de chaînes (ex: ["LIR","AGOA"])
Private Function ExtractTagsJSON(txt As String) As String
    Dim tags As Collection
    Set tags = New Collection
    Dim pos As Long, fin As Long
    pos = InStr(1, txt, "[")
    Do While pos > 0
        fin = InStr(pos + 1, txt, "]")
        If fin = 0 Then Exit Do
        Dim t As String
        t = Mid$(txt, pos + 1, fin - pos - 1)
        t = Trim$(t)
        If Len(t) > 0 Then
            On Error Resume Next
            tags.Add """" & EscapeJS(UCase$(t)) & """"
            On Error GoTo 0
        End If
        pos = InStr(fin + 1, txt, "[")
    Loop
    If tags.Count = 0 Then
        ExtractTagsJSON = "[]"
    Else
        ExtractTagsJSON = "[" & JoinCollection(tags, ",") & "]"
    End If
End Function
